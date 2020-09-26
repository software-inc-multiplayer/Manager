const { BrowserWindow, screen } = require("electron");
const path = require("path");
const url = require("url");
const electronLocalShortcut = require("electron-localshortcut");
const { dialog } = require("electron");

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
    /**win.loadURL(
        url.format({
            pathname: path.join(__dirname, "html", "firstTime.html"),
            protocol: "file:",
            slashes: true,
        })
    );**/
    win.loadFile(path.join(__dirname, "html", "firstTime.html"));
    win.removeMenu();
    electronLocalShortcut.register(win, "CTRL+I", () => {
        win.webContents.openDevTools();
    });
    win.show();
};
