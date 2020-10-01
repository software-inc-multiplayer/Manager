const settings = require("electron-settings");

const electron = require("electron");
const windows = {
    home: require("./windows/home.js"),
    firstTime: require("./windows/firstTime.js"),
    noInternet: require("./windows/noInternet.js"),
};
async function init() {
    global.isProd = false;
    await electron.app.whenReady();
    const onlineCheck = await require("is-online")();
    if (!onlineCheck) {
        windows.noInternet();
        return;
    }
    settings.configure({
        prettify: true,
        numSpaces: 4,
    });
    const firstTime = await settings.has("firstTime");
    if (!firstTime) {
        windows.firstTime();
        return;
    }
    windows.home();
}
init();
