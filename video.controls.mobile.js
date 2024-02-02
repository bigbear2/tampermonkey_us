// ==UserScript==

// @name                Video Mobile Fabio L.
// @description         Controls any HTML5 video
// @version             0.13

// @namespace           io.bigbear2.video.mobile
// @include             *

// @supportURL          https://github.com/ni554n/userscripts/issues
// @license             MIT
// @icon                https://www.google.com/s2/favicons?sz=64&domain=logitech.com
// @require             http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @author              Fabio Lucci
// @homepageURL         https://github.com/bigbear2

// @resource     PURE_CSS   https://www.official1off.com/apps/shared/pure-min.css
// @resource     BASE_CSS   https://unpkg.com/basscss@8.0.2/css/basscss.min.css

// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

function addEventListenerAll(target, listener, ...otherArguments) {

    // install listeners for all natively triggered events
    for (const key in target) {
        if (/^on/.test(key)) {
            const eventType = key.substr(2);
            if (eventType.includes("transition")) continue;
            if (eventType.includes("pointer")) continue;
            target.addEventListener(eventType, listener, ...otherArguments);
        }
    }

    // dynamically install listeners for all manually triggered events, just-in-time before they're dispatched ;D
    const dispatchEvent_original = EventTarget.prototype.dispatchEvent;

    function dispatchEvent(event) {
        target.addEventListener(event.type, listener, ...otherArguments);  // multiple identical listeners are automatically discarded
        dispatchEvent_original.apply(this, arguments);
    }

    EventTarget.prototype.dispatchEvent = dispatchEvent;
    if (EventTarget.prototype.dispatchEvent !== dispatchEvent) throw new Error(`Browser is smarter than you think!`);

}

document.module_video = {
    video_info: {
        "valid": false,
        "text": "",
        "percent": 0,
        "speed": 0,
        "currentTime": 0,
        "duration": 0,
        "play": false,
        "rect": {
            "left": 0,
            "top": 0,
        }
    },
    controller: null,
    is_controller: false,
    in_frame: (window !== window.top),
    in_frame_element: null,
    actual_video: null,
    setResource: (name, is_style = false) => {
        let remote_resource = GM_getResourceText(name);
        if (is_style) {
            GM_addStyle(remote_resource);
        } else {
            eval(remote_resource);
        }
        return remote_resource
    },
    log: (values, text = '', error = false) => {
        let tag = 'color: white; background: #367dc3 ; font-size: 14px; margin-right:5px; padding:4px';
        if (error) {
            console.log('%cVIDEO' + '%c' + text, tag, 'color: white; background: #721c24 ; font-size: 14px; padding:4px');
        } else {
            console.log('%cVIDEO' + '%c' + text, tag, 'color: black; background: #cfe3f7 ; font-size: 14px; padding:4px');
        }
        if (values !== "") console.log(values);
    },
    log_event: (event) => {
        let video = event.target;
        let type = event.type;
        let path = document.userscript_global.getXPathElement(video);

        if (type !== "timeupdate") document.module_video.log("", type);
        document.module_video.parse_event(event);

    },
    parse_event: (event) => {
        let video = event.target;
        let type = event.type;
        let path = document.userscript_global.getXPathElement(video);

        switch (type) {
            case "loadstart":
                break;
            case "durationchange":
                break;
            case "loadedmetadata":
                break;
            case "loadeddata":
                break;
            case "progress":
                break;
            case "canplay":
                document.module_video.set_actual_video(video);
                break;
            case "canplaythrough":
                document.module_video.set_actual_video(video);
                break;
            case "playing":
                break;
            case "play":
                document.module_video.video_info.play = true;
                document.module_video.set_actual_video(video);
                break;
            case "pause":
                document.module_video.video_info.play = false;
                document.module_video.set_actual_video(video);
                break;
            case "timeupdate":
                document.module_video.get_video_info();
                document.module_video.set_video_info();
                break;
            default:
                return;
        }

        if (document.module_video.video_info.valid)
            document.module_video.init_controller(video);
    },
    get_video_info: () => {
        let video = document.module_video.actual_video;
        if (!$(video).length) return;

        let duration = document.userscript_global.secondsToHms(video.duration);
        let currentTime = document.userscript_global.secondsToHms(video.currentTime);
        let playbackRate = video.playbackRate;
        let percent = Math.ceil((video.currentTime / video.duration) * 100);
        let text = currentTime + " / " + duration + " | " + `${percent}%`;  //" | Speed: " + playbackRate;

        let rect = video.getBoundingClientRect();

        let video_info = {
            "valid": true,
            "text": text,
            "percent": percent,
            "speed": playbackRate,
            "currentTime": currentTime,
            "duration": duration,
            "play": document.module_video.video_info.play,
            "rect": {
                "left": rect.left,
                "top": rect.top,
            }
        }
        document.module_video.video_info = video_info;
        if (document.module_video.in_frame) {
            window.parent.document.module_video_controller.video_info = video_info;
        }
        //console.log(document.module_video.video_info);
    },
    set_video_info: () => {
        if (document.module_video.in_frame) {
            window.parent.document.module_video_controller.video_info = document.module_video.video_info;
            window.parent.document.module_video_controller.update_timer();
        } else {
            document.module_video_controller.video_info = document.module_video.video_info;
            document.module_video_controller.update_timer();
        }
    },
    set_actual_video: (video) => {
        document.module_video.actual_video = video;
        document.module_video.get_video_info();

        if (document.module_video.in_frame) {
            window.parent.document.module_video.actual_video = video;
            window.parent.document.module_video.get_video_info();
            window.parent.document.module_video_controller.video = video;
            window.parent.document.module_video_controller.video_info = document.module_video.video_info;
            window.parent.document.module_video_controller.update_controls();
        } else {
            document.module_video_controller.video = video;
            document.module_video_controller.video_info = document.module_video.video_info;
            document.module_video_controller.update_controls();
        }

    },
    init_controller: (video) => {
        if (document.module_video.is_controller) return;
        document.module_video.is_controller = true;

        if (document.module_video.in_frame) {
            document.module_video.log("", "INIT CONTROLLER IFRAME");
            window.parent.document.module_video.iframe = document.module_video.get_iframe();
            window.parent.document.module_video.init_controller(video);
            return;
        }
        document.module_video.log("", "INIT CONTROLLER");

        //document.module_video.setResource("PURE_CSS", true);
        document.module_video.setResource("BASE_CSS", true);
        //document.module_video.set_actual_video(video);

        document.module_video_controller.init(video);
    },
    get_iframe: () => {
        return {
            exist: (window !== window.top),
            href: window.location.href,
            elm: null
        };
    }
}

document.addEventListener("playing", document.module_video.log_event, {
    capture: true,
    once: true
});
document.addEventListener("playing", document.module_video.log_event, {
    capture: true
});
document.addEventListener("play", document.module_video.log_event, true);
document.addEventListener("pause", document.module_video.log_event, true);
document.addEventListener("timeupdate", document.module_video.log_event, true);
document.addEventListener("loadstart", document.module_video.log_event, true);
document.addEventListener("durationchange", document.module_video.log_event, true);
document.addEventListener("loadedmetadata", document.module_video.log_event, true);
document.addEventListener("loadeddata", document.module_video.log_event, true);
document.addEventListener("progress", document.module_video.log_event, true);
document.addEventListener("canplay", document.module_video.log_event, true);
document.addEventListener("canplaythrough", document.module_video.log_event, true);

document.module_video_controller = {
    speed_control: {
        down: false
    },
    display: {
        show: false,
        id: -1,
    },
    iframe: {
        exist: false,
        href: "",
        elm: null
    },
    video: null,
    video_info: {
        "valid": false,
        "text": "",
        "percent": 0,
        "speed": 0,
        "currentTime": 0,
        "duration": 0,
        "play": false,
        "rect": {
            "left": 0,
            "top": 0,
        }
    },
    touch: {
        x_start: 0,
        y_start: 0,
        x_end: 0,
        y_end: 0,
    },
    init_controller: false,
    in_fullscreen: false,
    btn_prev_5: null,
    btn_prev_25: null,
    btn_prev_50: null,
    btn_fullscreen: null,
    btn_play: null,
    btn_next_5: null,
    btn_next_25: null,
    btn_next_50: null,
    progress_bar: null,
    range_speed: null,

    lbl_display_text: null,

    img_play: null,
    img_pause: null,
    img_fullscreen_on: null,
    img_fullscreen_off: null,
    init: (video) => {
        if (document.module_video_controller.init_controller) return;
        document.module_video_controller.init_controller = true;

        document.module_video_controller.video = video;
//document.module_video.actual_video.ownerDocument.location.href
        let data = document.module_video_controller.getOffset(video);
        let html = document.module_video_controller.html_controller_bootstrap();
        html += document.module_video_controller.html_display_text(data);

        $("body").append(html);

        document.module_video_controller.btn_prev_5 = $("#us-video-controls-m5");
        document.module_video_controller.btn_prev_25 = $("#us-video-controls-m25");
        document.module_video_controller.btn_prev_50 = $("#us-video-controls-m50");
        document.module_video_controller.btn_fullscreen = $("#us-video-controls-f50");
        document.module_video_controller.btn_play = $("#us-video-controls-play");
        document.module_video_controller.btn_next_5 = $("#us-video-controls-p5");
        document.module_video_controller.btn_next_25 = $("#us-video-controls-p25");
        document.module_video_controller.btn_next_50 = $("#us-video-controls-p50");
        document.module_video_controller.progress_bar = $(".us-video-controls-progress");
        //document.module_video_controller.range_speed = $("#us-video-controls-speed");
        document.module_video_controller.lbl_display_text = $(".us-video-display-text");

        document.module_video_controller.img_play = $("#us-video-controls-img-play");
        document.module_video_controller.img_pause = $("#us-video-controls-img-pause");
        document.module_video_controller.img_fullscreen_on = $("#us-video-controls-img-on");
        document.module_video_controller.img_fullscreen_off = $("#us-video-controls-img-off");

        $(".us-video-controls-seek").on("click", (evt) => {
            document.module_video_controller.seeking(evt);
        });
        $(".us-video-seek").on("click", (evt) => {
            document.module_video_controller.seeking(evt);
        });

        /*
               document.module_video_controller.range_speed.on("click", (evt) => {
                   let value = evt.currentTarget.value;
                   console.log(value);
                   document.module_video_controller.speed(value);
               });

               addEventListenerAll(document.module_video_controller.range_speed, (evt) => {
                   console.log(evt.type);
               });


              document.module_video_controller.range_speed.on('mouseup', (event) => {
                   let value = event.currentTarget.value;
                   console.log("mouseup", value);
                   document.module_video_controller.speed_control.down = false;
               }, {passive: true});
               document.module_video_controller.range_speed.on('mousedown', (event) => {
                   let value = event.currentTarget.value;
                   console.log("mousedown", value);
                   document.module_video_controller.speed_control.down = true;
               }, {passive: true});
               document.module_video_controller.range_speed.on('mousemove', (event) => {
                   let value = event.currentTarget.value;
                   if (document.module_video_controller.speed_control.down)
                       console.log("mousemove", value);
               }, {passive: true});
       */

        document.module_video_controller.progress_bar.on("click", (evt) => {
            document.module_video_controller.progress(evt);
        });
        document.module_video_controller.btn_play.on("click", (evt) => {
            document.module_video_controller.play();
        });
        document.module_video_controller.btn_fullscreen.on("click", (evt) => {
            document.module_video_controller.fullscreen();
        });

        document.module_video_controller.progress_bar.on('touchstart', (event) => {
            let elm = event.currentTarget;
            console.log(event.type, elm);
            document.module_video_controller.touch.x_start = event.changedTouches[0].screenX;
            document.module_video_controller.touch.y_start = event.changedTouches[0].screenY;

        }, {passive: true});

        document.module_video_controller.progress_bar.on('touchend', (event) => {
            let elm = event.currentTarget;
            console.log(event.type, elm);
            document.module_video_controller.touch.x_end = event.changedTouches[0].screenX;
            document.module_video_controller.touch.y_end = event.changedTouches[0].screenY;
            document.module_video_controller.gesture();
        }, {passive: true});

        /*addEventListenerAll(document.module_video_controller.progress_bar[0], (evt) => {
            console.log(evt.type);
        });*/
    },
    seeking: (evt) => {
        console.log("module_video_controller.seeking");
        let id = evt.currentTarget.id.replace("us-video-controls-", "");
        let is_prev = (id.includes("m"));
        let seconds = parseInt(id.replace("p", "").replace("m", ""));
        if (isNaN(seconds)) return;
        if (is_prev) seconds = -1 * seconds;

        document.module_video_controller.video.currentTime += seconds;
        document.module_video_controller.display_text_show()
    },
    progress: (evt) => {
        let mouseX = evt.clientX;
        let b = evt.target.getBoundingClientRect();
        let percent = Math.ceil((mouseX / b.width) * 100);
        let current = Math.ceil((percent / 100) * document.module_video_controller.video.duration);

        document.module_video_controller.video.currentTime = current;
        document.module_video_controller.display_text_show()
    },
    play: () => {
        console.log("module_video_controller.play");
        if (!document.module_video_controller.video_info.valid) return;

        if (document.module_video_controller.video_info.play) {
            document.module_video_controller.video.pause();
            document.module_video_controller.display_text_show("PAUSE");
        } else {
            document.module_video_controller.video.play();
            document.module_video_controller.display_text_show("PLAY");
        }
    },
    fullscreen: () => {
        console.log("module_video_controller.fullscreen");
        if (!document.module_video_controller.video_info.valid) return;

        document.module_video_controller.in_fullscreen = !document.module_video_controller.in_fullscreen;
        if (document.module_video_controller.in_fullscreen) {
            $("#ff-div-fullscreen").addClass("us-video-fullscreen-div");
            $(document.module_video_controller.video.parentNode).addClass("us-video-fullscreen");
        } else {
            $(document.module_video_controller.video.parentNode).removeClass("us-video-fullscreen");
            $("#ff-div-fullscreen").removeClass("us-video-fullscreen-div");
        }

        document.module_video_controller.update_controls();
    },
    speed: (value) => {
        console.log("module_video_controller.speed");
        if (!document.module_video_controller.video_info.valid) return;

        clearInterval(document.module_video_controller.id_speed);

        let speed = parseInt(value);
        if (speed > -1) {
            if (speed === 0) speed = 1; else speed += 1;
            document.module_video_controller.video.playbackRate = speed;
            document.module_video_controller.display_text_show("SPEED X" + speed.toString());
            document.module_video_controller.speed_x = speed;
        } else {

            document.module_video_controller.speed_x = speed;
            document.module_video_controller.id_speed = setInterval(function () {
                if (!document.module_video_controller.video.paused) document.module_video_controller.video.pause();
                document.module_video_controller.video.currentTime += document.module_video_controller.speed_x;
                document.module_video_controller.display_text_show("SPEED X" + document.module_video_controller.speed_x.toString());
                if (document.module_video_controller.video.currentTime === 0)
                    clearInterval(document.module_video_controller.id_speed);
            }, 1000)
        }


    },
    update_timer: () => {

        if (!document.module_video_controller.video_info.valid) return;

        $(".us-video-controls-progress-fill").css("width", `${document.module_video_controller.video_info.percent}%`);
        $(".us-video-controls-progress-text").html(document.module_video_controller.video_info.text);
        $(".us-video-display-text").text(document.module_video_controller.video_info.text);

    },
    update_controls: () => {
        if (!document.module_video_controller.video_info.valid) return;
        if (!document.module_video_controller.init_controller) return;

        if (document.module_video_controller.video_info.play) {
            document.module_video_controller.btn_play.removeClass("ff-button-next-play");
            document.module_video_controller.btn_play.addClass("ff-button-next-pause");
            /*document.module_video_controller.img_play.hide();
            document.module_video_controller.img_pause.show();*/
        } else {
            document.module_video_controller.btn_play.removeClass("ff-button-next-pause");
            document.module_video_controller.btn_play.addClass("ff-button-next-play");
            /*document.module_video_controller.img_pause.hide();
            document.module_video_controller.img_play.show();*/
        }

        if (document.module_video_controller.in_fullscreen) {
            /*document.module_video_controller.img_fullscreen_on.hide();
            document.module_video_controller.img_fullscreen_off.show();*/
            document.module_video_controller.btn_fullscreen.removeClass("ff-button-fullscreen-on");
            document.module_video_controller.btn_fullscreen.addClass("ff-button-fullscreen-off");

        } else {
            /*document.module_video_controller.img_fullscreen_off.hide();
            document.module_video_controller.img_fullscreen_on.show();*/
            document.module_video_controller.btn_fullscreen.removeClass("ff-button-fullscreen-off");
            document.module_video_controller.btn_fullscreen.addClass("ff-button-fullscreen-on");

        }

        /*if (document.module_video_controller.speed_x < 0 && document.module_video_controller.video_info.play)
            document.module_video_controller.speed(1);*/
    },
    display_text_show: (text = null, duration = 4000) => {
        if (!document.module_video_controller.video_info.valid) return;
        let data = document.module_video_controller.video_info.rect;

        document.module_video_controller.lbl_display_text.css({
            "left": `${data.left + 5}px`,
            "top": `${data.top + 5}px`,
        });

        if (text === null) text = document.module_video_controller.video_info.text;
        document.module_video_controller.lbl_display_text.text(text);

        if (document.module_video_controller.display.show) {
            clearTimeout(document.module_video_controller.display.id);
        } else {
            document.module_video_controller.display.show = true;
            document.module_video_controller.lbl_display_text.show(200);
        }
        document.module_video_controller.display.id = setTimeout(function () {
            document.module_video_controller.lbl_display_text.hide(200);
            document.module_video_controller.display.show = false;

        }, duration);
    },
    gesture: () => {
        if (!document.module_video_controller.video_info.valid) return;

        let data = document.module_video_controller.touch;
        let diff = 0;
        let touch_diff = data.x_end;
        let touch_type = 1;


        if (data.x_end < data.x_start) {
            diff = data.x_start - data.x_end;
            touch_diff = data.x_start;
            touch_type = -1;
            console.log('Swiped Left', diff);
        }

        if (data.x_end > data.x_start) {
            diff = data.x_end - data.x_start;
            touch_diff = data.x_end;
            touch_type = 1;
            console.log('Swiped Right', diff);
        }

        if (data.y_end === data.y_start) {
            diff = touch_diff;
            touch_type = 0;
            console.log('Tap');
        }


        let touchableElement = document.querySelector(".us-video-controls-progress");
        let b = touchableElement.getBoundingClientRect();

        diff = Math.ceil(diff / 2);
        let percent = Math.ceil((diff / b.width) * 100);
        let current = Math.ceil((percent / 100) * document.module_video_controller.video_info.duration);

        switch (touch_type) {
            case -1:
                document.module_video_controller.video.currentTime += (current * -1);
                break;
            case 0:
                //data.video.currentTime = current;
                break;
            case 1:
                document.module_video_controller.video.currentTime += current;
                break;
        }

        document.module_video_controller.display_text_show();


    },
    getOffset: (el) => {
        const rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
        };
    },
    html_controller: () => {
        let is_mobile = false;
        let csl = "us-video-controls-seek"
        return `
<style>
    #us-video-controls-fullscreen {
        background: #030303;
        bottom: 0;
        left: 0;
        position: fixed;
        right: 0;
        top: 0;
        z-index: 88888
    }

    #us-video-controls-panel {
        background: dimgrey;
        border-radius: 5px;
        bottom: 3px;
        color: #fff;
        font-size: 16px;
        height: 90px;
        left: 6px;
        padding: 3px;
        position: fixed;
        right: 6px;
        text-decoration: none;
        transition: .2s;
        z-index: 99999
    }

    #us-video-controls-panel:hover {
        /*opacity: .9*/
    }

    .us-video-controls-progress {
        background-color: #e0e0e0;
        border-radius: 3px;
        box-shadow: inset 0 1px 3px #0003;
        padding: 3px;
        width: 99%
    }

    .us-video-controls-progress-fill {
        background-color: #659cef;
        border-radius: 3px;
        display: block;
        height: 20px;
        transition: width 200ms ease-in-out
    }

    .us-video-controls-progress-text {
        bottom: 28px;
        color: #000;
        font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 12px;
        font-weight: 700;
        height: 20px;
        left: 0;
        position: fixed;
        text-align: center;
        width: 100%;
        z-index: 999999;
        text-shadow: 3px 3px 2px rgba(181, 181, 181, 1);
    }

    .pure-button {
        height: 40px;
        padding: 10px 7px;
        width: 40px
    }

    #us-video-controls-f50 {
        margin-left: 5px
    }

    #us-video-controls-play {
        margin-right: 5px
    }

    .us-rotate-video-on {
        transform: rotate(90deg) scale(1.5, 1.5);
        position: fixed;
        z-index: 89999;
    }

    .us-video-display-text {
        background: rgba(8, 8, 8, 0.3) ;
        padding: 5px;
        position: fixed;
        left: 5px;
        top: 5px;
         display: inline-block;
        font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 20px;
        text-shadow: 3px 2px 2px rgba(128, 0, 0, 1);
        border-radius: 3px;
        z-index: 99999;
    }
</style>


<div id="us-video-controls-panel" class="sidenav">
    <form class="pure-form pure-g">

        <div class="pure-u-1" style="text-align: center">
            <div class="pure-button-group" role="group" aria-label="...">
                <button class="pure-button us-video-controls ${csl}" id="us-video-controls-m50" type="button">
                    <img src="https://www.official1off.com/apps/shared/img/prev-50.png" width="20" height="20" alt=""/>
                </button>
                <button class="pure-button us-video-controls ${csl}" id="us-video-controls-m25" type="button">
                    <img src="https://www.official1off.com/apps/shared/img/prev-25.png" width="20" height="20" alt=""/>
                </button>
                <button class="pure-button us-video-controls ${csl}" id="us-video-controls-m5" type="button">
                    <img src="https://www.official1off.com/apps/shared/img/prev-5.png" width="20" height="20" alt=""/>
                </button>

                <button class="pure-button us-video-controls " id="us-video-controls-f50" type="button">
                    <img src="https://www.official1off.com/apps/shared/img/fullscreen-on.png" width="20" height="20"
                         id="us-video-controls-img-on" alt=""/>
                    <img src="https://www.official1off.com/apps/shared/img/fullscreen-off.png" width="20" height="20"
                         id="us-video-controls-img-off" style="display: none;" alt=""/>
                </button>
                <button class="pure-button us-video-controls " id="us-video-controls-play" type="button">
                    <img src="https://www.official1off.com/apps/shared/img/play.png" width="20" height="20"
                         id="us-video-controls-img-play" alt=""/>
                    <img src="https://www.official1off.com/apps/shared/img/pause.png" width="20" height="20"
                         id="us-video-controls-img-pause" style="display: none;" alt=""/>
                </button>

                <button class="pure-button us-video-controls ${csl}" id="us-video-controls-p5" type="button">
                    <img src="https://www.official1off.com/apps/shared/img/next-5.png" width="20" height="20" alt=""/>
                </button>
                <button class="pure-button us-video-controls ${csl}" id="us-video-controls-p25" type="button">
                    <img src="https://www.official1off.com/apps/shared/img/next-25.png" width="20" height="20" alt=""/>
                </button>
                <button class="pure-button us-video-controls ${csl}" id="us-video-controls-p50" type="button">
                    <img src="https://www.official1off.com/apps/shared/img/next-50.png" width="20" height="20" alt=""/>
                </button>

            </div>
        </div>

        <div class="pure-u-1" style="margin-top: 3px">
            <div class="us-video-controls-progress">
                <span class="us-video-controls-progress-fill" style="width: 100%;"></span>
                <span class=us-video-controls-progress-text>100%</span>
            </div>
        </div>
        <div class="pure-u-1" style="margin-top: 3px">
           <input type="range" class="form-control-range" id="us-video-controls-speed" min="-5" max="5" style="width: 99%">
        </div>
    </form>
</div>
        `;

    },
    html_display_text: (data) => {
        return `
<style>
    .us-video-display-text {
        position: fixed;
        left: ${data.left}px;
        top: ${data.top}px;
        width: ${data.width}px;
        height: 50px;
        font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 24px;
        text-shadow: 3px 3px 2px rgba(48, 52, 160, 1);
        color: white;
        z-index: 99999;
    }
</style>
<div class="us-video-display-text" style="display: none;" >00:00</div>`;
    },
    html_controller_bootstrap: () => {
        return `
<style>
    #us-video-controls-panel {
        background: rgb(43, 42, 50, 1);
        position: fixed;
        /*border-radius: 5px;*/
        bottom: 0;
        left: 0;
        right: 0;
        color: #fff;
        font-size: 16px;
        height: auto;
        padding: 3px;
        text-decoration: none;
        transition: .2s;
        z-index: 99999
    }

    .ff-button {
        background: transparent;
        border: 0;
        width: 26px;
        height: 26px;
        margin: 6px;
    }

    .ff-button:active {
        box-shadow: 7px 6px 18px 1px rgba(0, 0, 0, 0.24);
        transform: translateY(2px);
    }


    .col {
        text-align: center;
    }

    .ff-button-prev-50 {
        background: url("https://www.official1off.com/apps/shared/img/ff-prev-50.png") center no-repeat;
    }

    .ff-button-next-50 {
        background: url("https://www.official1off.com/apps/shared/img/ff-next-50.png") center no-repeat;
    }

    .ff-button-prev-25 {
        background: url("https://www.official1off.com/apps/shared/img/ff-prev-25.png") center no-repeat;
    }

    .ff-button-next-25 {
        background: url("https://www.official1off.com/apps/shared/img/ff-next-25.png") center no-repeat;
    }

    .ff-button-prev-5 {
        background: url("https://www.official1off.com/apps/shared/img/ff-prev-5.png") center no-repeat;
    }

    .ff-button-next-5 {
        background: url("https://www.official1off.com/apps/shared/img/ff-next-5.png") center no-repeat;
    }

    .ff-button-next-play {
        background: url("https://www.official1off.com/apps/shared/img/ff-play.png") center no-repeat;
    }

    .ff-button-next-pause {
        background: url("https://www.official1off.com/apps/shared/img/ff-pause.png") center no-repeat;
    }

    .ff-button-fullscreen-off {
        background: url("https://www.official1off.com/apps/shared/img/ff-fullscreen-off.png") center no-repeat;
    }

    .ff-button-fullscreen-on {
        background: url("https://www.official1off.com/apps/shared/img/ff-fullscreen-on.png") center no-repeat;
    }


    .us-video-controls-progress {
        position: relative;
        background-color: silver;
        border-radius: 3px;
        width: 100%
    }

    .us-video-controls-progress-fill {
        display: block;
        background: repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px);
        border-radius: 3px;
        height: 20px;
        transition: width 200ms ease-in-out
    }

    .us-video-controls-progress-text {
        position: absolute;
        left: 0;
        top: 2px;
        color: white;
        font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 12px;
        font-weight: 700;
        height: 20px;
        text-align: center;
        width: 100%;
        z-index: 10;
        text-shadow: 3px 3px 2px rgba(10, 10, 10, 1);
    }
    
     .us-video-fullscreen-div {
        position: fixed;
        background: black;
        left: 0px;
        top: 0px;
        width: 100vw;
        height: 100vh;
        z-index: 77777;
    }

    .us-video-fullscreen {
        position: fixed!important;
        left: 0px!important;
        top: 0px!important;
        width: 100vw!important;
        height: 80vh!important;
        z-index: 88888!important;
    }
</style>

<div id="ff-div-fullscreen"></div>
<div class="clearfix" id="us-video-controls-panel">
     <div class="col col-1">
        <button class="ff-button ff-button-prev-50 us-video-seek" type="button" id="us-video-controls-m50"></button>
    </div>
    <div class="col col-1">
        <button class="ff-button ff-button-prev-25 us-video-seek" type="button" id="us-video-controls-m25"></button>
    </div>
    <div class="col col-1">
        <button class="ff-button ff-button-prev-5 us-video-seek" type="button" id="us-video-controls-m5"></button>
    </div>
    
    <div class="col col-1">
        <button class="ff-button" type="button"></button>
    </div>
    <div class="col col-1">
        <button class="ff-button" type="button"></button>
    </div>

    <div class="col col-1">
        <button class="ff-button ff-button-next-play" type="button" id="us-video-controls-play"></button>
    </div>
    <div class="col col-1">
        <button class="ff-button ff-button-fullscreen-on" type="button" id="us-video-controls-f50"></button>
    </div>

    <div class="col col-1">
        <button class="ff-button" type="button"></button>
    </div>
    <div class="col col-1">
        <button class="ff-button" type="button"></button>
    </div>

    <div class="col col-1">
        <button class="ff-button ff-button-next-5 us-video-seek" type="button" id="us-video-controls-p5"></button>
    </div>
    <div class="col col-1">
        <button class="ff-button ff-button-next-25 us-video-seek" type="button" id="us-video-controls-p25"></button>
    </div>
    <div class="col col-1">
        <button class="ff-button ff-button-next-50 us-video-seek" type="button" id="us-video-controls-p50"></button>
    </div>

    <div class="col col-12">
        <div class="us-video-controls-progress">
            <span class="us-video-controls-progress-fill" style="width: 0%;"></span>
            <span class=us-video-controls-progress-text>0%</span>
        </div>
    </div>

    <!--<div class="col col-12">
        <input type="range" class="form-control-range" id="us-video-controls-speed" min="-5" max="5" style="width: 99%">
    </div>-->
</div>
`;
    }
}
