const settings = require("electron-settings");

const windows = {
    home: require("./windows/home.js"),
    firstTime: require("./windows/firstTime.js"),
};

async function init() {
    const firstTime = await settings.has("firstTime");
    if (!firstTime) {
        windows.firstTime();
    }
}
init();
