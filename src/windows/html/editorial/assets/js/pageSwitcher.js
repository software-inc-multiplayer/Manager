const fs = require("fs");
const $ = require("jquery");
const { ipcRenderer } = require("electron").remote;
(async () => {
    const pages = new Map();
    $(window).on("load", () => {
        fs.readdirSync(process.cwd() + "/src/windows/html/pageviews/home")
            .filter((file) => file.endsWith(".html"))
            .forEach((pageView) => {
                pages.set(
                    pageView.split("-")[0],
                    fs.readFileSync(
                        process.cwd() +
                            "/src/windows/html/pageviews/home" +
                            "/" +
                            pageView,
                        {
                            encoding: "utf-8",
                        }
                    )
                );
            });
        document.getElementById("main").innerHTML = pages.get("main");
        $("#playButton").on("click", () => {
            ipcRenderer.emit("openGame");
        });
        $("#showPlayTab").on("click", () => {
            document.getElementById("main").innerHTML = pages.get("main");
            $("#playButton").on("click", () => {
                ipcRenderer.emit("openGame");
            });
        });
        $("#showChatTab").on("click", () => {
            document.getElementById("main").innerHTML = pages.get("chat");
        });
    });
})();
