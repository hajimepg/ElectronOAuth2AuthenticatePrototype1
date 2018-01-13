import * as fs from "fs";
import * as path from "path";
import * as querystring from "querystring";
import * as url from "url";

import axios from "axios";
import { app, BrowserWindow, ipcMain } from "electron";
import * as lodash from "lodash";

import GoogleAuth from "./googleAuth";
import PocketAuth from "./pocketAuth";

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

const authCredentials = JSON.parse(fs.readFileSync(path.join(__dirname, "../../credentials.json"), "utf-8"));

let googleAuth: GoogleAuth;

ipcMain.on("google-auth", (event) => {
    googleAuth = new GoogleAuth(
        authCredentials.google.client_id,
        authCredentials.google.client_secret
    );

    googleAuth.getAccessToken()
        .then((accessToken) => {
            event.sender.send("google-auth-reply", null, accessToken);
        })
        .catch((error: Error) => {
            event.sender.send("google-auth-reply", error.message, null);
        });
});

let pocketAuth: PocketAuth;

ipcMain.on("pocket-auth", (event) => {
    pocketAuth = new PocketAuth(authCredentials.pocket.consumer_key);

    pocketAuth.getAccessToken()
        .then((accessToken) => {
            if (window !== null) {
                window.show();
            }
            event.sender.send("pocket-auth-reply", null, accessToken);
        })
        .catch((error: Error) => {
            event.sender.send("pocket-auth-reply", error.message, null);
        });
});
