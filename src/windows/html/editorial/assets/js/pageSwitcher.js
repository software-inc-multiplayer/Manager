const fs = require("fs");
const $ = require("jquery");
const { ipcRenderer } = require("electron");
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
            console.log("Opening Game...");
            ipcRenderer.sendSync("openGame");
        });
        console.log(ipcRenderer);
        $("#showPlayTab").on("click", () => {
            document.getElementById("main").innerHTML = pages.get("main");
            $("#playButton").on("click", () => {
                console.log("Opening Game...");
                ipcRenderer.sendSync("openGame");
            });
        });
        $("#showChatTab").on("click", () => {
            document.getElementById("main").innerHTML = pages.get("chat");
        });
    });
})();
