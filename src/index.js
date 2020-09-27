const settings = require("electron-settings");

const electron = require("electron");

const windows = {
    home: require("./windows/home.js"),
    firstTime: require("./windows/firstTime.js"),
};

async function init() {
    const onlineCheck = await require("is-online")();
    if (!onlineCheck) {
        await electron.dialog.showMessageBox(null, {
            title: "No internet.",
            message:
                "You need an internet connection to load the multiplayer manager.",
            type: "warning",
        });
        electron.app.exit();
        return;
    }
    settings.configure({
        prettify: true,
        numSpaces: 4,
    });
    const firstTime = await settings.has("firstTime");
    if (!firstTime) {
        electron.app.whenReady().then(windows.firstTime());
    }
}
init();
