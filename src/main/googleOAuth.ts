import * as querystring from "querystring";
import * as url from "url";

import axios from "axios";
import { BrowserWindow } from "electron";

export default class GoogleOAuth {
    public static readonly redirectUri = "http://localhost/";

    public clientId: string;
    public clientSecret: string;

    public get oauthUrl(): string {
        return url.format({
            hostname: "accounts.google.com",
            pathname: "/o/oauth2/v2/auth",
            protocol: "https",
            search: querystring.stringify({
                access_type: "online",
                client_id: this.clientId,
                redirect_uri: GoogleOAuth.redirectUri,
                response_type: "code",
                scope: [
                    "https://www.googleapis.com/auth/plus.me",
                ]
            }),
            slashes: true,
        });
    }

    public constructor(
        clientId: string,
        clientSecret: string
    ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public getAccessToken(): Promise<string> {
        let isReceiveCallback = false;
        const self = this;

        return new Promise<string>((resolve, reject) => {
            const window = new BrowserWindow({ width: 800, height: 600 });

            window.on("closed", () => {
                if (isReceiveCallback === false) {
                    reject(new Error("Authentication cancel."));
                }
            });

            window.webContents.on("will-navigate", (event, willNagivateUrl) => {
                if (willNagivateUrl.startsWith(GoogleOAuth.redirectUri)) {
                    isReceiveCallback = true;
                    const parsedUrl = new url.URL(willNagivateUrl);

                    if (parsedUrl.searchParams.has("error")) {
                        const error = parsedUrl.searchParams.get("error");
                        reject(error);
                    }
                    else {
                        const code = parsedUrl.searchParams.get("code");

                        axios.post("https://www.googleapis.com/oauth2/v4/token",
                            querystring.stringify({
                                client_id: self.clientId,
                                client_secret: self.clientSecret,
                                code,
                                grant_type: "authorization_code",
                                redirect_uri: GoogleOAuth.redirectUri
                            })
                        )
                        .then((response) => {
                            resolve(response.data.access_token);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                    }

                    event.preventDefault();

                    window.close();
                }
            });

            window.loadURL(this.oauthUrl);
        });
    }
}
