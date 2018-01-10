import * as querystring from "querystring";
import * as url from "url";

import axios from "axios";
import { BrowserWindow } from "electron";

export default class GoogleOAuth {
    public clientId: string;
    public clientSecret: string;
    public sender: { send(channel: string, ...rest: any[]) };

    public window: BrowserWindow | null;
    public isReplyIPC = false;

    public constructor(
        clientId: string,
        clientSecret: string,
        sender: { send(channel: string, ...rest: any[]) }
    ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.sender = sender;
    }

    public showWindow() {
        const self = this;
        const redirectUri = "http://localhost/";

        const oauthUrl = url.format({
            hostname: "accounts.google.com",
            pathname: "/o/oauth2/v2/auth",
            protocol: "https",
            search: querystring.stringify({
                access_type: "online",
                client_id: this.clientId,
                redirect_uri: redirectUri,
                response_type: "code",
                scope: [
                    "https://www.googleapis.com/auth/plus.me",
                ]
            }),
            slashes: true,
        });

        this.window = new BrowserWindow({ width: 800, height: 600 });

        this.window.webContents.on("will-navigate", (event, willNagivateUrl) => {
            if (willNagivateUrl.startsWith(redirectUri)) {
                const parsedUrl = new url.URL(willNagivateUrl);

                if (parsedUrl.searchParams.has("error")) {
                    const error = parsedUrl.searchParams.get("error");
                    self.sender.send("google-oauth-reply", error, null);
                    self.isReplyIPC = true;
                }
                else {
                    const code = parsedUrl.searchParams.get("code");

                    axios.post("https://www.googleapis.com/oauth2/v4/token",
                        querystring.stringify({
                            client_id: self.clientId,
                            client_secret: self.clientSecret,
                            code,
                            grant_type: "authorization_code",
                            redirect_uri: redirectUri
                        })
                    )
                    .then((response) => {
                        self.sender.send("google-oauth-reply", null, response.data.access_token);
                        self.isReplyIPC = true;
                    })
                    .catch((error) => {
                        self.sender.send("google-oauth-reply", error, null);
                        self.isReplyIPC = true;
                    });
                }

                event.preventDefault();

                if (self.window !== null) {
                    self.window.close();
                }
            }
        });

        this.window.loadURL(oauthUrl);

        this.window.on("closed", () => {
            if (this.isReplyIPC === false) {
                self.sender.send("google-oauth-reply", "Authentication cancel.", null);
                self.isReplyIPC = true;
            }
            self.window = null;
        });
    }
}
