import * as fs from "fs";
import * as path from "path";
import * as querystring from "querystring";
import * as url from "url";

import { app, BrowserWindow, ipcMain } from "electron";

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

ipcMain.on("StartOAuth", (event) => {
    const oauthUrl = url.format({
        hostname: "accounts.google.com",
        pathname: "/o/oauth2/v2/auth",
        protocol: "https",
        search: querystring.stringify({
            access_type: "online",
            client_id: oauthCredentials.google.client_id,
            redirect_uri: "http://localhost/",
            response_type: "code",
            scope: [
                "https://www.googleapis.com/auth/plus.me",
            ]
        }),
        slashes: true,
    });

    oauthWindow = new BrowserWindow({ width: 800, height: 600 });

    oauthWindow.loadURL(oauthUrl);

    oauthWindow.on("closed", () => {
        oauthWindow = null;
    });
});
