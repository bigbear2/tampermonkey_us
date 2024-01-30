// ==UserScript==

// @name                Video Controls Fabio L.
// @description         Controls any HTML5 video playback speed by pressing shortcut keys. See source code comment for the shortcut keymap.
// @version             0.2

// @namespace           io.bigbear2.videocontrol
// @include             *

// @supportURL          https://github.com/ni554n/userscripts/issues
// @license             MIT
// @icon                https://www.google.com/s2/favicons?sz=64&domain=logitech.com
// @require             http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require             https://cdnjs.cloudflare.com/ajax/libs/zingtouch/1.0.6/zingtouch.min.js
// @author              Fabio Lucci
// @homepageURL         https://github.com/bigbear2

// @resource     TOUCH_JS   https://cdnjs.cloudflare.com/ajax/libs/zingtouch/1.0.6/zingtouch.min.jss
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

/* Keymap:
 * ┌─────┬───────┐
 * │ Key │ Speed │
 * ├─────┼───────┤
 * │  ,  │ -0.5x │
 * ├─────┼───────┤
 * │  .  │ +0.5x │
 * ├─────┼───────┤
 * │  ;  │   1x  │
 * ├─────┼───────┤
 * │  '  │  2.5x │
 * ├─────┼───────┤
 * │  [  │   2x  │
 * ├─────┼───────┤
 * │  ]  │ 1.75x │
 * └─────┴───────┘
 */

// Stores currently playing video element reference for changing the speed later.
let video;
let video_progress_timeout;
// Stores currently selected speed. Also acts as default / initial playback speed for all video.
let speed = 1;
let auto_volume = ['www.eporner.com'];
const emoji_error = "\u{1F4A2}";
/* The "playing" event always fires automatically at the start of a video but "play" event is not.
 * After using the event for the initial key registration, "play" event is used for capturing the active video reference.
 */

//position: absolute; z-index: 999999; font-size: 12px; padding: 5px 10px; background: rgba(0, 0, 0, 0.4); color: white; top: 0px; left: 0px; transition: all 500ms ease 0s; opacity: 0; border-bottom-right-radius: 5px; display: none; -webkit-font-smoothing: subpixel-antialiased; font-family: &quot;microsoft yahei&quot;, Verdana, Geneva, sans-serif; user-select: none;
function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function secondsToHms(d) {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor((d % 3600) / 60);
    let s = Math.floor((d % 3600) % 60);

    let hDisplay = padDigits(h, 2) + ":";
    if (hDisplay == "00:") hDisplay = "";

    return hDisplay + padDigits(m, 2) + ":" + padDigits(s, 2);
}

const user_progressbar = {
    width: 1,
    elem: document.getElementById("progress-bar-content"),
    elem_text: document.getElementById("progress-bar-content-text"),
    step: function () {
        this.width++;
        if (this.width >= 100) this.width = 100;
        this.elem.style.width = self.width + "%";
        this.elem.innerHTML = self.width + "%";
    },
    position: function (percent, text = "") {
        console.log(percent);
        if (percent >= 100) percent = 100;
        self.width = percent;
        this.elem.style.width = width + "%";
        if (text === "")
            this.elem_text.innerHTML = self.width + "%";
        else
            this.elem_text.innerHTML = text + " (" + self.width + "%)";
    },
    positionFrom(current, max, text = "") {
        let percent = 0;
        if (max > 0) percent = Math.ceil((current / max) * 100);
        this.position(percent, text);
    },
    init() {

    }

}


function videoTimeProgress() {

    let div = document.querySelector("#video-progress");
    if (div !== null) return;

    let w = 0;
    try {
        w = video.parentElement.offsetWidth;
        //w = $(video).parent().width();
    } catch (error) {
        console.debug(emoji_error + ' ' + error.message);
        return;
    }
    //  console.log("WIDTH", w);

    $("body").append(`
<style>
    #video-progress {
        position: absolute;
        text-align: center;
        width: ${w}px;
        z-index: 999999;
        font-size: 14px;
        padding: 6px 10px;
        background: rgba(0, 0, 0, 0.4);
        color: white;
        top: 0px;
        left: 0px;
        height: 20px;
        border-bottom-right-radius: 5px;
        -webkit-font-smoothing: subpixel-antialiased;
        font-family: Verdana, Geneva, sans-serif;
    }

    #progress-bar-main {
        width: 100%;
        background-color: #828282;
    }

    #progress-bar-content {
        width: 0%;
        height: 20px;
        background-color: #04AA6D;
        text-align: center;
        line-height: 20px;
        color: white;
    }

    #progress-bar-content-text {
        position: fixed;
        text-align: center;
        width: ${w}px;
        z-index: 999999;
        font-size: 12px;
        color: white;
        top: 8px;
        left: 0px;
        height: 20px;
        font-family: Verdana, Geneva, sans-serif;
    }

</style>
    `);

    //let a = "<div id='video-progress' style='z-index: 999999; padding: 5px 10px; background-color rgba(0,0,0,.5);color: #fff; position:absolute;top: 0px; left: 0px;'>ADDED</div>";
    //let a = "<div id='video-progress'>ADDED</div>";
    let a = `<div id='video-progress'>
        <div id="progress-bar-main">
            <div id="progress-bar-content">&nbsp;</div>
            <div id="progress-bar-content-text">0%</div>
        </div>
    </div>`;
    $(video).parent().append(a);
    $("#video-progress").hide();
    user_progressbar.elem = document.getElementById("progress-bar-content");
    user_progressbar.elem_text = document.getElementById("progress-bar-content-text");
    //console.log("VSC - ADD PROGRESS");

    $(video).on("seeking", function () {
        let is_visible = $("#video-progress").is(":visible");
        let duration = secondsToHms(this.duration);
        let currentTime = secondsToHms(this.currentTime);
        let playbackRate = this.playbackRate;
        //console.log("seeking", currentTime, duration, is_visible);
        let text = currentTime + " / " + duration + " | Speed: " + playbackRate;
        //$("#video-progress").html(text);
        user_progressbar.positionFrom(this.currentTime, this.duration, text);

        if (!is_visible) $("#video-progress").show();

        clearTimeout(video_progress_timeout);
        video_progress_timeout = setTimeout(function () {
            $("#video-progress").hide();
        }, 2000);

    })

    us_videocontrol.attach(video);

}

function showProgress() {
    let duration = video.duration;
    let currentTime = video.currentTime;
}

function setAutovolume(player) {
    let host = location.hostname;

    if (auto_volume.includes(host)) {

        if (player.muted == true) {
            player.setAttribute("muted", false);
            player.muted = false;
            player.volume = 1;
        }
        console.log("MUTED", player.muted, "VOLUME", player.volume);

    }

}

document.addEventListener("playing", registerShortcutKeys, {
    capture: true,
    once: true
});
document.addEventListener("playing", restoreSpeed, {
    capture: true
});
document.addEventListener("play", captureActiveVideoElement, true);

function registerShortcutKeys(event) {
    captureActiveVideoElement(event);

    document.addEventListener("keydown", handlePressedKey);
}

function restoreSpeed(event) {
    if (event.target.playbackRate !== speed) event.target.playbackRate = speed;
}

function captureActiveVideoElement(event) {
    video = event.target;
    speed = video.playbackRate;
    us_videocontrol.video = video;

    setTimeout(function () {
        videoTimeProgress();
    }, 300);

    setAutovolume(video);
}

function instantControls() {
    if (video.hasAttribute("controls")) {
        //video.removeAttribute("controls")
    } else {
        video.setAttribute("controls", "controls")
        setTimeout(function () {
            video.removeAttribute("controls")
        }, 3000);
    }
}

function toggleControls() {
    if (video.hasAttribute("controls")) {
        video.removeAttribute("controls")
    } else {
        video.setAttribute("controls", "controls")
    }
}

document.addEventListener("DOMContentLoaded", function (event) {

    let elm_video = document.getElementsByTagName("video");
    for (let i = 0; i < elm_video.length; i++) {
        setAutovolume(video);
    }

});

function videoCommands(key, code) {
    console.debug("KEY", key, "CODE", code);

    if (code >= 97 && code <= 105) {
        let position = 0;
        let part_fast = video.duration / 50;
        let part_slow = video.duration / 25;
        switch (code) {
            case 105: //9
                position = part_fast;
                break;
            case 104: //8
                position = -part_fast;
                break;
            case 102: //6
                position = part_slow;
                break;
            case 101: //5
                position = -part_slow;
                break;
            case 99: //6
                position = 5;
                break;
            case 97: //5
                position = -5;
                break;
        }
        instantControls();
        video.currentTime = video.currentTime + position;
        return;
    }

    if (code >= 49 && code <= 57) {
        let part = video.duration / 10;
        let p = parseInt(key) * part;
        instantControls();
        video.currentTime = p;
        return;
    }


}

function handlePressedKey(event) {
    // If the pressed key is coming from any input field, do nothing.
    const target = event.target;
    if (target.localName === "input" || target.localName === "textarea" || target.isContentEditable) return;

    //addProgress();

    // Mapping keys with actions.
    const key = event.key;
    const code = event.which;
    console.debug("KEY", key, "CODE", code);

    if (key === ",") video.playbackRate -= 0.5;
    //else if (key === ".") video.playbackRate += 0.5;
    else if (key === ";") video.playbackRate = 1;
    else if (key === "\'") video.playbackRate = 2.5;
    else if (key === "[") video.playbackRate = 2;
    else if (key === "]") video.playbackRate = 1.75;
    else if (Number.isNaN(key)) {
        let part = video.duration / 10;
        let p = parseInt(key) * part;
        instantControls();
        video.currentTime = p;
    } else if (key === "w" || key === "W" || key === "ù") {
        let part = video.duration / 50;
        instantControls();
        video.currentTime = video.currentTime + part;
    } else if (key === "q" || key === "Q" || key === "à") {
        let part = video.duration / 50;
        instantControls();
        video.currentTime = video.currentTime - part;
    } else if (key === "a" || key === "A" || key === "è") {
        let part = video.duration / 25;
        instantControls();
        video.currentTime = video.currentTime - part;
    } else if (key === "s" || key === "S" || key === "+") {
        let part = video.duration / 25;
        instantControls();
        video.currentTime = video.currentTime + part;
    } else if (key === "-") {
        instantControls();
        video.currentTime += 10;
    } else if (key === ".") {
        instantControls();
        video.currentTime -= 10;
    } else if (key === "n") {
        toggleControls();
    }

    if (code === 80) {
        instantControls();
        video.currentTime += 5;
    } else if (code === 192) {
        instantControls();
        video.currentTime -= 5;
    }
    setAutovolume(video);

    // Saving the speed for next resume or video playback.
    speed = video.playbackRate;
}

const us_videocontrol = {
    is_attached: false,
    video: null,
    pan:null,
    setResource: function (name, is_style = false) {
        let remote_resource = GM_getResourceText(name);
        if (is_style) {
            GM_addStyle(remote_resource);
        } else {
            eval(remote_resource);
        }
        return remote_resource
    },
    init: () => {
        us_videocontrol.setResource("TOUCH_JS");
    },
    attach2: (elm = null) => {
        if (us_videocontrol.is_attached) return;
        us_videocontrol.is_attached = true;
        console.log(["ATTACH", elm], "VIDEO CONTROL");

        if (elm === null) elm = us_videocontrol.video;

        us_videocontrol.touchArea = elm;
        us_videocontrol.myRegion = new ZingTouch.Region(us_videocontrol.touchArea, false, true);

        us_videocontrol.pan = new ZingTouch.Pan({numInputs: 1})

        us_videocontrol.pan.start  = function (e) {
            console.log("START", e);
        }
        us_videocontrol.pan.end = function (e) {
            console.log("END PAN", e);
        }
        us_videocontrol.myRegion.bind(us_videocontrol.touchArea, us_videocontrol.pan, function (e) {

        })
    },
    attach: (elm = null) => {
        if (us_videocontrol.is_attached) return;
        us_videocontrol.is_attached = true;
        console.log(["ATTACH", elm], "VIDEO CONTROL");

        if (elm === null) elm = us_videocontrol.video;


        us_videocontrol.myRegion.bind(us_videocontrol.touchArea, 'pan', function (e) {
            let data = e.detail.data[0];
            switch (data.currentDirection) {
                case 360:
                    us_videocontrol.seeking(2, false);
                    break;
                case 180:
                    us_videocontrol.seeking(2, true);
                    break;
            }

            console.log(e.detail);
        });

        us_videocontrol.myRegion.bind(us_videocontrol.touchArea, 'swipe', function (e) {
            //console.log(e.detail);
            let data = e.detail.data[0];
            console.log(data);
            us_videocontrol.seeking(data.duration, false);

        });
    },
    seeking: (seconds, is_left = false) => {
        if (is_left) seconds = -1 * seconds;
        setTimeout(function () {
            video.pause();
            video.currentTime = video.currentTime + seconds;
            video.play();
        }, 500)
    }
}

