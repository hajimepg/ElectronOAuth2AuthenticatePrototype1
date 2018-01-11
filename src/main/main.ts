import * as fs from "fs";
import * as path from "path";
import * as querystring from "querystring";
import * as url from "url";

import axios from "axios";
import { app, BrowserWindow, ipcMain } from "electron";
import * as lodash from "lodash";

import GoogleOAuth from "./googleOAuth";

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

let googleOAuth: GoogleOAuth;

const oauthCredentials = JSON.parse(fs.readFileSync(path.join(__dirname, "../../credentials.json"), "utf-8"));

ipcMain.on("google-oauth", (event) => {
    googleOAuth = new GoogleOAuth(
        oauthCredentials.google.client_id,
        oauthCredentials.google.client_secret
    );

    googleOAuth.getAccessToken()
        .then((accessToken) => {
            event.sender.send("google-oauth-reply", null, accessToken);
        })
        .catch((error: Error) => {
            event.sender.send("google-oauth-reply", error.message);
        });
});
