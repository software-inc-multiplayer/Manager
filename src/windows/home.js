const { BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const electronLocalShortcut = require("electron-localshortcut");
const ipc = ipcMain;
const settings = require("electron-settings");
const open = require("open");

const { resolve } = require("app-root-path");

module.exports = async function spawn() {
    const win = new BrowserWindow({
        width: screen.getPrimaryDisplay().size.width,
        height: screen.getPrimaryDisplay().size.height,
        webPreferences: {
            nodeIntegrationInSubFrames: true,
            nodeIntegration: true,
        },
        icon: __dirname + "\\icon.ico",
    });
    if (global.isProd) {
        win.loadURL(
            url.format({
                pathname: path.join(__dirname, "html", "home.html"),
                protocol: "file:",
                slashes: true,
            })
        );
    } else {
        win.loadFile(path.join(__dirname, "html", "home.html"));
    }
    win.removeMenu();
    electronLocalShortcut.register(win, "CTRL+I", () => {
        win.webContents.openDevTools();
    });
    ipc.on("loaded", hideSplashscreen);
    ipc.on("openGame", async () => {
        win.hide();
        const installDir = await settings.get("installDir");
        if (installDir.toLowerCase().includes("steamapps")) {
            const modInstalled = await settings.get();
        }
        open();
    });
    win.on("ready-to-show", () => {
        if (global.isProd) win.show();
    });
};
