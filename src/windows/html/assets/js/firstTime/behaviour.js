const fs = require("fs");
const $ = require("jquery");
$.validate = require("jquery-validation");
const path = require("path");
const electron = require("electron").remote;
const settings = require("electron-settings");
const request = require("request");
const sweetAlert = require("sweetalert2").default;
var switcher = false;
const isDev = false;
var copies = {
    a: "",
    b: "",
};
(function () {
    var settings = {
        keyboardShortcuts: {
            enabled: true,

            distance: 50,
        },

        scrollWheel: {
            enabled: true,

            factor: 1,
        },

        scrollZones: {
            enabled: true,

            speed: 15,
        },

        dragging: {
            enabled: true,

            momentum: 0.875,

            threshold: 10,
        },

        excludeSelector:
            "input:focus, select:focus, textarea:focus, audio, video, iframe",

        linkScrollSpeed: 1000,
    };

    var $window = $(window),
        $document = $(document),
        $body = $("body"),
        $html = $("html"),
        $bodyHtml = $("body,html"),
        $wrapper = $("#wrapper"),
        $page = 0,
        $pages = new Map();

    function handlePageClick() {
        $("#wrapper");
        document.getElementById("page-wrapper").innerHTML = $pages.get(
            ($page + 1).toString()
        );
        $page++;
        if ($page == 1) {
            $("#next-1").hide();
        }
        if ($page == 2) {
            $("#next-2").hide();
            document.getElementById(`next-2`).onclick = () => {
                require("electron").ipcRenderer.sendSync("firstTimeComplete");
            };
            $("#signup").submit((e) => {
                e.preventDefault();
                if (!switcher) {
                    createAccount();
                } else {
                    loginAccount();
                }
            });
            $("#switcherButton").on("click", () => {
                switchRL();
            });
            return;
        }
        document.getElementById(`next-${$page}`).onclick = () =>
            handlePageClick();
    }

    breakpoints({
        xlarge: ["1281px", "1680px"],
        large: ["981px", "1280px"],
        medium: ["737px", "980px"],
        small: ["481px", "736px"],
        xsmall: ["361px", "480px"],
        xxsmall: [null, "360px"],
        short: "(min-aspect-ratio: 16/7)",
        xshort: "(min-aspect-ratio: 16/6)",
    });

    $window.on("load", async function () {
        fs.readdirSync(process.cwd() + "/src/windows/html/pageviews/firstTime")
            .filter((file) => file.endsWith(".html"))
            .forEach((pageView) => {
                $pages.set(
                    pageView.split("-")[0],
                    fs.readFileSync(
                        process.cwd() +
                            "/src/windows/html/pageviews/firstTime" +
                            "/" +
                            pageView,
                        {
                            encoding: "utf-8",
                        }
                    )
                );
            });
        $("#next").click(handlePageClick);
        window.setTimeout(function () {
            $body.removeClass("is-preload");
        }, 100);
        /**
			const validReleases = [];
			await fetch("https:
				data.forEach(release => {
					if(!release.tag_name.endsWith("-installer")) return;
					validReleases.push(release);
				});			
			});
			var releaseOntop;
			validReleases.forEach(release => {
				if(!releaseOntop) {
					releaseOntop = release;
					return;
				}
				const releaseDate = Date.parse(release.published_at);
				const topDate = Date.parse(releaseOntop.published_at);
				if(compareTime(topDate, releaseDate)) {
					releaseOnTop = release;
				}
			});
			console.log("Latest Release: \n");
			console.log(releaseOntop)
			**/
    });

    if (browser.mobile) {
        settings.keyboardShortcuts.enabled = false;
        settings.scrollWheel.enabled = false;
        settings.scrollZones.enabled = false;
        settings.dragging.enabled = false;

        $body.css("overflow-x", "auto");
    }

    if (browser.name == "ie") {
        $body.addClass("is-ie");

        $window.on("load resize", function () {
            var w = 0;

            $wrapper.children().each(function () {
                w += $(this).width();
            });

            $html.css("width", w + "px");
        });
    }

    if (!browser.canUse("object-fit")) {
        $(".image[data-position]").each(function () {
            var $this = $(this),
                $img = $this.children("img");

            $this
                .css("background-image", 'url("' + $img.attr("src") + '")')
                .css("background-position", $this.data("position"))
                .css("background-size", "cover")
                .css("background-repeat", "no-repeat");

            $img.css("opacity", "0");
        });
    }

    if (settings.keyboardShortcuts.enabled)
        (function () {
            $wrapper.on(
                "keypress keyup keydown",
                settings.excludeSelector,
                function (event) {
                    event.stopPropagation();
                }
            );

            $window.on("keydown", function (event) {
                var scrolled = false;

                switch (event.keyCode) {
                    case 37:
                        $document.scrollLeft(
                            $document.scrollLeft() -
                                settings.keyboardShortcuts.distance
                        );
                        scrolled = true;
                        break;

                    case 39:
                        $document.scrollLeft(
                            $document.scrollLeft() +
                                settings.keyboardShortcuts.distance
                        );
                        scrolled = true;
                        break;

                    case 33:
                        $document.scrollLeft(
                            $document.scrollLeft() - $window.width() + 100
                        );
                        scrolled = true;
                        break;

                    case 34:
                    case 32:
                        $document.scrollLeft(
                            $document.scrollLeft() + $window.width() - 100
                        );
                        scrolled = true;
                        break;

                    case 36:
                        $document.scrollLeft(0);
                        scrolled = true;
                        break;

                    case 35:
                        $document.scrollLeft($document.width());
                        scrolled = true;
                        break;
                }

                if (scrolled) {
                    event.preventDefault();
                    event.stopPropagation();

                    $bodyHtml.stop();
                }
            });
        })();

    if (settings.scrollWheel.enabled)
        (function () {
            var normalizeWheel = function (event) {
                var pixelStep = 10,
                    lineHeight = 40,
                    pageHeight = 800,
                    sX = 0,
                    sY = 0,
                    pX = 0,
                    pY = 0;

                if ("detail" in event) sY = event.detail;
                else if ("wheelDelta" in event) sY = event.wheelDelta / -120;
                else if ("wheelDeltaY" in event) sY = event.wheelDeltaY / -120;

                if ("wheelDeltaX" in event) sX = event.wheelDeltaX / -120;

                if ("axis" in event && event.axis === event.HORIZONTAL_AXIS) {
                    sX = sY;
                    sY = 0;
                }

                pX = sX * pixelStep;
                pY = sY * pixelStep;

                if ("deltaY" in event) pY = event.deltaY;

                if ("deltaX" in event) pX = event.deltaX;

                if ((pX || pY) && event.deltaMode) {
                    if (event.deltaMode == 1) {
                        pX *= lineHeight;
                        pY *= lineHeight;
                    } else {
                        pX *= pageHeight;
                        pY *= pageHeight;
                    }
                }

                if (pX && !sX) sX = pX < 1 ? -1 : 1;

                if (pY && !sY) sY = pY < 1 ? -1 : 1;

                return {
                    spinX: sX,
                    spinY: sY,
                    pixelX: pX,
                    pixelY: pY,
                };
            };

            $body.on("wheel", function (event) {
                if (breakpoints.active("<=small")) return;

                event.preventDefault();
                event.stopPropagation();

                $bodyHtml.stop();

                var n = normalizeWheel(event.originalEvent),
                    x = n.pixelX != 0 ? n.pixelX : n.pixelY,
                    delta =
                        Math.min(Math.abs(x), 150) *
                        settings.scrollWheel.factor,
                    direction = x > 0 ? 1 : -1;

                $document.scrollLeft(
                    $document.scrollLeft() + delta * direction
                );
            });
        })();

    if (settings.scrollZones.enabled)
        (function () {
            var $left = $('<div class="scrollZone left"></div>'),
                $right = $('<div class="scrollZone right"></div>'),
                $zones = $left.add($right),
                paused = false,
                intervalId = null,
                direction,
                activate = function (d) {
                    if (breakpoints.active("<=small")) return;

                    if (paused) return;

                    $bodyHtml.stop();

                    direction = d;

                    clearInterval(intervalId);

                    intervalId = setInterval(function () {
                        $document.scrollLeft(
                            $document.scrollLeft() +
                                settings.scrollZones.speed * direction
                        );
                    }, 25);
                },
                deactivate = function () {
                    paused = false;

                    clearInterval(intervalId);
                };

            $zones
                .appendTo($wrapper)
                .on("mouseleave mousedown", function (event) {
                    deactivate();
                });

            $left.css("left", "0").on("mouseenter", function (event) {
                activate(-1);
            });

            $right.css("right", "0").on("mouseenter", function (event) {
                activate(1);
            });

            $wrapper.on("---pauseScrollZone", function (event) {
                paused = true;

                setTimeout(function () {
                    paused = false;
                }, 500);
            });
        })();

    if (settings.dragging.enabled)
        (function () {
            var dragging = false,
                dragged = false,
                distance = 0,
                startScroll,
                momentumIntervalId,
                velocityIntervalId,
                startX,
                currentX,
                previousX,
                velocity,
                direction;

            $wrapper

                .on("mouseup mousemove mousedown", ".image, img", function (
                    event
                ) {
                    event.preventDefault();
                })

                .on(
                    "mouseup mousemove mousedown",
                    settings.excludeSelector,
                    function (event) {
                        event.stopPropagation();

                        dragging = false;
                        $wrapper.removeClass("is-dragging");
                        clearInterval(velocityIntervalId);
                        clearInterval(momentumIntervalId);

                        $wrapper.triggerHandler("---pauseScrollZone");
                    }
                );
        })();

    $wrapper
        .on("mousedown mouseup", 'a[href^="#"]', function (event) {
            event.stopPropagation();
        })
        .on("click", 'a[href^="#"]', function (event) {
            var $this = $(this),
                href = $this.attr("href"),
                $target,
                x,
                y;

            if (href == "#" || ($target = $(href)).length == 0) return;

            event.preventDefault();
            event.stopPropagation();

            if (breakpoints.active("<=small")) {
                x =
                    $target.offset().top -
                    Math.max(0, $window.height() - $target.outerHeight()) / 2;
                y = { scrollTop: x };
            } else {
                x =
                    $target.offset().left -
                    Math.max(0, $window.width() - $target.outerWidth()) / 2;
                y = { scrollLeft: x };
            }

            $bodyHtml.stop().animate(y, settings.linkScrollSpeed, "swing");
        });

    $(".gallery")
        .on("click", "a", function (event) {
            var $a = $(this),
                $gallery = $a.parents(".gallery"),
                $modal = $gallery.children(".modal"),
                $modalImg = $modal.find("img"),
                href = $a.attr("href");

            if (!href.match(/\.(jpg|gif|png|mp4)$/)) return;

            event.preventDefault();
            event.stopPropagation();

            if ($modal[0]._locked) return;

            $modal[0]._locked = true;

            $modalImg.attr("src", href);

            $modal.addClass("visible");

            $modal.focus();

            setTimeout(function () {
                $modal[0]._locked = false;
            }, 600);
        })
        .on("click", ".modal", function (event) {
            var $modal = $(this),
                $modalImg = $modal.find("img");

            if ($modal[0]._locked) return;

            if (!$modal.hasClass("visible")) return;

            event.stopPropagation();

            $modal[0]._locked = true;

            $modal.removeClass("loaded");

            setTimeout(function () {
                $modal.removeClass("visible");

                $wrapper.triggerHandler("---pauseScrollZone");

                setTimeout(function () {
                    $modalImg.attr("src", "");

                    $modal[0]._locked = false;

                    $body.focus();
                }, 475);
            }, 125);
        })
        .on("keypress", ".modal", function (event) {
            var $modal = $(this);

            if (event.keyCode == 27) $modal.trigger("click");
        })
        .on("mouseup mousedown mousemove", ".modal", function (event) {
            event.stopPropagation();
        })
        .prepend(
            '<div class="modal" tabIndex="-1"><div class="inner"><img src="" /></div></div>'
        )
        .find("img")
        .on("load", function (event) {
            var $modalImg = $(this),
                $modal = $modalImg.parents(".modal");

            setTimeout(function () {
                if (!$modal.hasClass("visible")) return;

                $modal.addClass("loaded");
            }, 275);
        });
})();

async function selectInstallation() {
    while (true) {
        const dialog = await electron.dialog.showOpenDialog(
            electron.getCurrentWindow(),
            {
                title: "Select Software Inc Folder",
                properties: ["openDirectory"],
            }
        );
        if (dialog.canceled) return;
        if (
            !fs.existsSync(dialog.filePaths[0] + "/Mods") ||
            !fs.existsSync(dialog.filePaths[0] + "/DLLMods")
        ) {
            await sweetAlert.fire({
                titleText: "Invalid Software Inc Folder",
                text:
                    "Couldn't detect DLLMod folder or Mods folder in the directory you chosen, please select the correct installation directory.",
                icon: "warning",
                confirmButtonText: "OK",
                timer: 3500,
            });
            continue;
        } else {
            document.getElementById("location").innerText = dialog.filePaths[0];
            $("#next-1").show();
            settings.set("install-dir", dialog.filePaths[0]);
            break;
        }
    }
}
async function createAccount() {
    const validator = $("#signup").validate();
    if (!validator.form()) return;
    const data = $("#signup").serializeArray();
    const formMap = new Map();
    data.forEach((data) => {
        formMap.set(data.name, data.value);
    });
    if (formMap.get("username").length < 3) {
        sweetAlert.fire({
            titleText: "Invalid username.",
            text: "Please use a username with 3 or more characters.",
            icon: "warning",
        });
        return;
    }
    if (formMap.get("password").length < 6) {
        sweetAlert.fire({
            titleText: "Password invalid.",
            text:
                "Please use a password with 6 or more characters, for the strongest password, use symbols and numbers.",
            icon: "warning",
        });
        return;
    }
    const acc = {
        username: formMap.get("username"),
        password: formMap.get("password"),
        email: formMap.get("email"),
    };
    console.log(acc);

    let url = "https://us-central1-multiplayer-mod.cloudfunctions.net/api";
    if (isDev) {
        url = "http://localhost:5001/multiplayer-mod/us-central1/api/";
    }
    request(
        url + "/accounts/has?username=" + acc.username,
        (err, res, body) => {
            if (err) {
                sweetAlert.fire({
                    titleText: "Error - Restart the manager.",
                    text: err.toString(),
                    icon: "error",
                });
                return;
            }
            const result = JSON.parse(body);
            if (result.has) {
                sweetAlert.fire({
                    titleText: "Username already in use.",
                    text: "Use a different username.",
                    icon: "warning",
                });
                return;
            }
            request.post(
                url + "/accounts/create",
                {
                    body: acc,
                    json: true,
                    headers: [
                        {
                            name: "content-type",
                            value: "application/json",
                        },
                    ],
                },
                (err, res, body) => {
                    if (err) {
                        sweetAlert.fire({
                            titleText: "Error - Restart the manager.",
                            text: err.toString(),
                            icon: "error",
                        });
                        return;
                    }
                    document.getElementById("titleMajor").innerHTML =
                        "Account created!";
                    document.getElementById("descriptionMajor").innerHTML =
                        "The multiplayer manager is nearly setup!";
                    $("#subButtonse").hide();
                    $("#resetButt").hide();
                    $("#fields").hide();
                    $("#switcherButton").hide();
                    $("#next-2").show();
                }
            );
        }
    );
}
function loginAccount() {
    let url = "https://us-central1-multiplayer-mod.cloudfunctions.net/api";
    if (isDev) {
        url = "http://localhost:5001/multiplayer-mod/us-central1/api/";
    }
    const validator = $("#signup").validate();
    if (!validator.form()) return;
    const data = $("#signup").serializeArray();
    const formMap = new Map();
    data.forEach((data) => {
        formMap.set(data.name, data.value);
    });
    const acc = {
        username: formMap.get("username"),
        password: formMap.get("password"),
    };
    console.log(acc);
    request.post(
        url + "/accounts/login",
        {
            body: acc,
            json: true,
            headers: [
                {
                    name: "content-type",
                    value: "application/json",
                },
            ],
        },
        (err, res, body) => {
            if (err) {
                sweetAlert.fire({
                    titleText: "Error - Restart the manager.",
                    text: err.toString(),
                    icon: "error",
                });
                return;
            }
            console.log(body);
            const result = body;
            if (result.status == "INVUSR") {
                sweetAlert.fire({
                    titleText: "Invalid username or password.",
                    text:
                        "Please enter a correct username or password. Forgot your username/password? Find your registration email with your info and reset link.",
                    icon: "error",
                });
                return;
            }
            if (result.status == "INVPASS") {
                sweetAlert.fire({
                    titleText: "Invalid  password.",
                    text:
                        "Please enter the correct password. Forgot your password? Find your registration email with your info and reset link.",
                    icon: "error",
                });
                return;
            }
            document.getElementById("titleMajor").innerHTML = "Logged in!";
            document.getElementById("descriptionMajor").innerHTML =
                "The multiplayer manager is nearly setup!";
            settings.setSync("user", result.user);
            settings.setSync("token", result.user.token);
            $("#subButtonse").hide();
            $("#resetButt").hide();
            $("#fields").hide();
            $("#switcherButton").hide();
            $("#next-2").show();
        }
    );
}

function switchRL() {
    if (!switcher) {
        switcher = true;
        document.getElementById("titleMajor").innerHTML =
            "Login to your SIMM account.";
        document.getElementById("subButton").innerHTML = "Login";
        document.getElementById("switcherButton").innerHTML =
            "Register Instead..";
        copies.a = document.getElementById("rfielda").outerHTML;
        copies.b = document.getElementById("rfieldb").outerHTML;
        document.getElementById("rfielda").remove();
        document.getElementById("rfieldb").remove();
    } else {
        switcher = false;
        document.getElementById("titleMajor").innerHTML =
            "Create a SIMM account.";
        document.getElementById("subButton").innerHTML = "Sign Up";
        document.getElementById("switcherButton").innerHTML = "Login Instead..";
        document.getElementById("beforeThem").outerHTML += copies.a;
        document.getElementById("rfielda").outerHTML += copies.b;
    }
}
