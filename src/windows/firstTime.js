const { BrowserWindow, screen, app } = require("electron");
const path = require("path");
const url = require("url");
const settings = require("electron-settings");
const electronLocalShortcut = require("electron-localshortcut");
const { dialog, ipcMain } = require("electron");
const { unlinkSync } = require("fs");
const home = require("./home");
const ipc = ipcMain;

module.exports = async function spawn() {
    unlinkSync(settings.file());
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
                pathname: path.join(__dirname, "html", "firstTime.html"),
                protocol: "file:",
                slashes: true,
            })
        );
    } else {
        win.loadFile(path.join(__dirname, "html", "firstTime.html"));
    }
    win.removeMenu();
    electronLocalShortcut.register(win, "CTRL+I", () => {
        win.webContents.openDevTools();
    });
    ipc.on("firstTimeComplete", () => {
        settings.setSync("firstTime", true);
        win.destroy();
        home();
    });
    win.show();
};
