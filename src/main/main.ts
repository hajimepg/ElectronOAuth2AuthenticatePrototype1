import * as fs from "fs";
import * as path from "path";
import * as querystring from "querystring";
import * as url from "url";

import axios from "axios";
import { app, BrowserWindow, ipcMain } from "electron";
import * as lodash from "lodash";

let window: BrowserWindow | null;

function createWindow() {
    window = new BrowserWindow({ width: 800, height: 600 });

    window.loadURL(url.format({
        pathname: path.join(__dirname, "../../static/index.html"),
        protocol: "file:",
        slashes: true
    }));

    window.webContents.openDevTools();

    window.on("closed", () => {
        window = null;
    });
}

app.on("ready", () => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (window === null) {
        createWindow();
    }
});

let oauthWindow: BrowserWindow | null;

const oauthCredentials = JSON.parse(fs.readFileSync(path.join(__dirname, "../../credentials.json"), "utf-8"));

ipcMain.on("google-oauth", (event) => {
    const clientId = oauthCredentials.google.client_id;
    const clientSecret = oauthCredentials.google.client_secret;
    const redirectUri = "http://localhost/";

    const oauthUrl = url.format({
        hostname: "accounts.google.com",
        pathname: "/o/oauth2/v2/auth",
        protocol: "https",
        search: querystring.stringify({
            access_type: "online",
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: [
                "https://www.googleapis.com/auth/plus.me",
            ]
        }),
        slashes: true,
    });

    oauthWindow = new BrowserWindow({ width: 800, height: 600 });

    oauthWindow.webContents.on("will-navigate", (navigateEvent, willNagivateUrl) => {
        if (willNagivateUrl.startsWith(redirectUri)) {
            const parsedUrl = new url.URL(willNagivateUrl);

            const error = parsedUrl.searchParams.get("error");
            if (error != null) {
                // TODO: エラー処理を実装する
            }

            const code = parsedUrl.searchParams.get("code");

            axios.post("https://www.googleapis.com/oauth2/v4/token",
                querystring.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    grant_type: "authorization_code",
                    redirect_uri: redirectUri
                })
            )
            .then((response) => {
                const accessToken = response.data.access_token;
                event.sender.send("google-oauth-reply", accessToken);
            })
            // tslint:disable-next-line:no-shadowed-variable
            .catch((error) => {
                console.log(error);
            });

            event.preventDefault();

            if (oauthWindow !== null) {
                oauthWindow.close();
            }
        }
    });

    oauthWindow.loadURL(oauthUrl);

    oauthWindow.on("closed", () => {
        oauthWindow = null;
    });
});
