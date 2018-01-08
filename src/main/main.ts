import * as path from "path";
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

ipcMain.on("StartOAuth", (event) => {
    console.log("StartOAuth");

    oauthWindow = new BrowserWindow({ width: 800, height: 600 });
    oauthWindow.loadURL("https://www.google.com");

    oauthWindow.on("closed", () => {
        oauthWindow = null;
    });
});
