// ==UserScript==

// @name                Video Mobile Fabio L.
// @description         Controls any HTML5 video
// @version             0.32

// @namespace           io.bigbear2.video.mobile
// @include             *

// @supportURL          https://github.com/ni554n/userscripts/issues
// @license             MIT
// @icon                https://www.official1off.com/apps/shared/img/ff-setting.png
// @require             http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @author              Fabio Lucci
// @homepageURL         https://github.com/bigbear2

// @resource     PURE_CSS   https://www.official1off.com/apps/shared/pure-min.css
// @resource     BASE_CSS   https://unpkg.com/basscss@8.0.2/css/basscss.min.css
// @resource     DW_JS   https://js.zapjs.com/js/download.js
// @resource     HAMMER_JS   https://raw.githubusercontent.com/bigbear2/tampermonkey_us/master/js/hammer.js

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
        //let path = document.userscript_global.getXPathElement(video);

        if (type !== "timeupdate") document.module_video.log("", type);
        document.module_video.parse_event(event);

    },
    parse_event: (event) => {
        let video = event.target;
        let type = event.type;
        //let path = document.userscript_global.getXPathElement(video);
        let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        let is_viewport_vertical = vw < vh;

        if (is_viewport_vertical && video.clientWidth < 200) return;
        if (!is_viewport_vertical && video.clientWidth < 320) return;

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
        document.module_video.setResource("DW_JS", false);
        document.module_video.setResource("HAMMER_JS", false);
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
    vw: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    vh: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
    is_viewport_vertical: false,
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
    lbl_display_icon: null,

    img_play: null,
    img_pause: null,
    img_fullscreen_on: null,
    img_fullscreen_off: null,
    table_sites: [],
    hammer: {
        "manage": null,
        "Swipe": null,
        "square": null,
        "deltaX": 0
    },
    find_data: (data, key, value) => {
        for (let i = 0; i < data.length; i++) {
            let obj_value = data[i][key];
            if (obj_value === value) return i;
        }
        return -1;
    },
    set_visibility_controls: (value) => {
        if (value) {
            $("#us-video-controls-panel").show(300);
            document.module_video_controller.lbl_display_icon.hide(300);
        } else {
            $("#us-video-controls-panel").hide(300);
            document.module_video_controller.lbl_display_icon.show(300);
        }
        document.module_video_controller.set_visibility_table(value);
    },
    set_visibility_table: (value) => {
        //let is_visible = ($("#us-video-controls-panel").css('display') === 'none' || $("#us-video-controls-panel").css("visibility") === "hidden");
        let host = window.location.host;
        let idx = document.module_video_controller.find_data(document.module_video_controller.table_sites, 'host', host);
        if (idx > -1) {
            document.module_video_controller.table_sites[idx].visible = value;
        } else {
            document.module_video_controller.table_sites.push({
                "host": host,
                "visible": value,
            })
        }
        GM_setValue("table_sites", JSON.stringify(document.module_video_controller.table_sites, null, 2));
    },
    get_visibility_table: () => {
        let data = GM_getValue("table_sites", "[]");
        document.module_video_controller.table_sites = JSON.parse(data);
        let idx = document.module_video_controller.find_data(document.module_video_controller.table_sites, 'host', window.location.host);
        if (idx > -1) {
            let visible = document.module_video_controller.table_sites[idx].visible;
            if (!visible) {
                $("#us-video-controls-panel").hide();
                document.module_video_controller.lbl_display_icon.show();
            }
        }
    },
    init: (video) => {
        if (document.module_video_controller.init_controller) return;
        document.module_video_controller.init_controller = true;
        console.log("VIEWSIZE", document.module_video_controller.vw, document.module_video_controller.vh);

        document.module_video_controller.is_viewport_vertical = document.module_video_controller.vw < document.module_video_controller.vh;

        document.module_video_controller.video = video;
        //document.module_video.actual_video.ownerDocument.location.href
        let data = document.module_video_controller.getOffset(video);
        let html = document.module_video_controller.html_controller_bootstrap();
        html += document.module_video_controller.html_display_text(data);
        html += document.module_video_controller.html_display_icon(data);

        $("body").append(html);

        document.module_video_controller.btn_close = $("#us-video-controls-close");
        document.module_video_controller.btn_download = $("#us-video-controls-download");
        document.module_video_controller.btn_audio = $("#us-video-controls-audio");

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
        document.module_video_controller.lbl_display_icon = $(".us-video-display-icon");

        document.module_video_controller.img_play = $("#us-video-controls-img-play");
        document.module_video_controller.img_pause = $("#us-video-controls-img-pause");
        document.module_video_controller.img_fullscreen_on = $("#us-video-controls-img-on");
        document.module_video_controller.img_fullscreen_off = $("#us-video-controls-img-off");

        document.module_video_controller.get_visibility_table();

        document.module_video_controller.gesture_init();

        document.module_video_controller.btn_audio.on("click", (evt) => {
            if (document.module_video_controller.video.muted) {
                document.module_video_controller.video.setAttribute("muted", false);
                document.module_video_controller.video.muted = false;
                document.module_video_controller.video.volume = 1;

                document.module_video_controller.btn_audio.removeClass("ff-button-audio-off");
                document.module_video_controller.btn_audio.addClass("ff-button-audio-on");
            } else {
                document.module_video_controller.video.setAttribute("muted", true);
                document.module_video_controller.video.muted = true;

                document.module_video_controller.btn_audio.removeClass("ff-button-audio-om");
                document.module_video_controller.btn_audio.addClass("ff-button-audio-off");
            }

        });
        document.module_video_controller.btn_download.on("click", (evt) => {
            let src = document.module_video_controller.video.currentSrc;

            if (confirm("Try new download?\n" + src)) {
                try {
                    download(src);
                } catch (e) {
                    alert(e.message);
                }
            } else {
                try {

                    let link = document.createElement('a');
                    link.download = "video.mp4";
                    link.href = "video/mp4";
                    link.click();
                    link.remove();

                } catch (e) {
                    alert(e.message);
                }
            }
            //window.open(src, "blank");

        });

        document.module_video_controller.btn_close.on("click", (evt) => {
            document.module_video_controller.set_visibility_controls(false);
        });

        document.module_video_controller.lbl_display_icon.on("click", (evt) => {
            document.module_video_controller.set_visibility_controls(true);
        });

        $(".us-video-controls-seek").on("click", (evt) => {
            document.module_video_controller.seeking(evt);
        });
        $(".us-video-seek").on("click", (evt) => {
            document.module_video_controller.seeking(evt);
        });
        $(".us-video-speed").on("click", (evt) => {
            let speed = evt.currentTarget.innerHTML;
            let current_speed = document.module_video_controller.video.playbackRate;
            switch (speed) {
                case "-1":
                    if (current_speed === 0.5) current_speed = 0;
                    document.module_video_controller.video.playbackRate = current_speed - 0.5;
                    break;
                case "+1":
                    if (current_speed === 0) current_speed = 1;
                    document.module_video_controller.video.playbackRate = current_speed + 0.5;
                    break;
                default:
                    document.module_video_controller.video.playbackRate = 1;

            }
            current_speed = document.module_video_controller.video.playbackRate;
            $("#us-video-speed-text").html("S: " + current_speed.toString());
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

        /*document.module_video_controller.progress_bar.on('touchstart', (event) => {
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
        }, {passive: true});*/

        /*addEventListenerAll(document.module_video_controller.progress_bar[0], (evt) => {
            console.log(evt.type);
        });*/

        document.module_video_controller.minimize = !document.module_video_controller.is_viewport_vertical;
        if (document.module_video_controller.minimize) $(".us-video-grid").hide();
        $("#us-video-controls-minimize").on("click", function () {
            document.module_video_controller.minimize = !document.module_video_controller.minimize;
            if (document.module_video_controller.minimize) {
                $(".us-video-grid").hide();
            } else {
                $(".us-video-grid").show();
            }
        })

        document.module_video_controller.keyboard_init();
    },
    seeking: (evt) => {
        console.log("module_video_controller.seeking");
        let seconds;
        let text = evt.currentTarget.innerText;
        if (text === "N") {
            seconds = document.module_video_controller.video.duration / 10;
        } else {
            let id = evt.currentTarget.id.replace("us-video-controls-", "");
            let is_prev = (id.includes("m"));
            seconds = parseInt(id.replace("p", "").replace("m", ""));
            if (isNaN(seconds)) return;
            if (is_prev) seconds = -1 * seconds;
        }
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
            if (document.module_video_controller.is_viewport_vertical)
                $(document.module_video_controller.video.parentNode).addClass("us-video-fullscreen-rotate");
        } else {
            $("#ff-div-fullscreen").removeClass("us-video-fullscreen-div");
            $(document.module_video_controller.video.parentNode).removeClass("us-video-fullscreen");
            if (document.module_video_controller.is_viewport_vertical)
                $(document.module_video_controller.video.parentNode).removeClass("us-video-fullscreen-rotate");

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
            if (!document.module_video_controller.is_viewport_vertical)
                document.module_video_controller.video.scrollIntoView();
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

        let data = document.module_video_controller.video_info.rect;
        document.module_video_controller.lbl_display_icon.css({
            "left": `${data.left + 5}px`,
            "top": `${data.top + 5}px`,
        });

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
    gesture_init: () => {

        document.module_video_controller.hammer.square = document.querySelector('.us-touch');
        document.module_video_controller.hammer.manager = new Hammer.Manager(document.module_video_controller.hammer.square);
        document.module_video_controller.hammer.Swipe = new Hammer.Swipe();
        document.module_video_controller.hammer.manager.add(document.module_video_controller.hammer.Swipe);
        document.module_video_controller.hammer.deltaX = 0;


        document.module_video_controller.hammer.manager.on('swipe', function (e) {

            document.module_video_controller.hammer.deltaX = document.module_video_controller.hammer.deltaX + e.deltaX;
            let direction = e.offsetDirection;
            if (direction === 4 || direction === 2) {
                document.module_video_controller.video.currentTime +=
                    document.module_video_controller.hammer.deltaX / 10;
                console.debug("DELTA", document.module_video_controller.hammer.deltaX / 10, document.module_video_controller.hammer.deltaX)
            }
        });

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
    keyboard_press: (key, code) => {
        if (!document.module_video_controller.video_info.valid) return;
        let video = document.module_video_controller.video;
        console.debug("KEY", key, "CODE", code);

        if (code > 57) {
            let position = 0;
            let part_fast = video.duration / 50;
            let part_slow = video.duration / 25;
            switch (code) {
                case 187:
                case 105 : //9
                    position = part_slow;
                    break;
                case 186:
                case 104: //8
                    position = -part_slow;
                    break;
                case 191:
                case 102: //6
                    position = part_fast;
                    break;
                case 222:
                case 101: //5
                    position = -part_fast;
                    break;
                case 80:
                case 99: //6
                    position = 5;
                    break;
                case 192:
                case 97: //5
                    position = -5;
                    break;
            }

            video.currentTime = video.currentTime + position;
            document.module_video_controller.display_text_show(position.toString() + ' sec.');
            return;
        }

        if (code >= 49 && code <= 57) {
            let part = video.duration / 10;
            let p = parseInt(key) * part;
            video.currentTime = p;
        }
    },
    keyboard_init: () => {
        window.addEventListener('keydown', function (event) {
            /*if (e.ctrlKey && e.keyCode == 90) {
                // Ctrl + z pressed
            }*/
            const key = event.key;
            const code = event.which;
            document.module_video_controller.keyboard_press(key, code);
        });
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
        z-index: 99998;
    }
</style>
<div class="us-video-display-text" style="display: none;" >00:00</div>`;
    },
    html_display_icon: (data) => {
        return `
<style>
    .us-video-display-icon {
        position: fixed;
        left: ${data.left}px;
        top: ${data.top}px;
        width: 30px;
        height: 30px;        
        z-index: 99999;
        
    }
</style>
<img src="https://www.official1off.com/apps/shared/img/ff-tune.png" alt="" width="30" height="30" class="us-video-display-icon" style="display: none;">
`;
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
        /*width: 26px;*/
        width: 95%;
        height: 26px;
        margin: 6px;
        border-radius: 3px;
        padding-top: 15px;
        padding-bottom: 26px;
        
    }

    .ff-button:active {
        box-shadow: 7px 6px 18px 1px rgba(0, 0, 0, 0.24);
        transform: translateY(2px);
        border: 1px solid lightgreen;
    }

    .ff-fucsia{
        border: 1px solid fuchsia;
    }

    .ff-lime{
        border: 1px solid lightgreen;
    }

    .ff-red{
        border: 1px solid red;
    }
    
    .ff-blue{
        border: 1px solid dodgerblue;
    }
    
    .col {
        text-align: center;
    }

    .ff-button-close {
        background: url("https://www.official1off.com/apps/shared/img/ff-close.png") center no-repeat;
        
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

    .ff-button-download {
        background: url("https://www.official1off.com/apps/shared/img/ff-download.png") center no-repeat;
    }
    
    .ff-button-audio-on {
        background: url("https://www.official1off.com/apps/shared/img/ff-audio-on.png") center no-repeat;
    }
    
    .ff-button-audio-off {
        background: url("https://www.official1off.com/apps/shared/img/ff-audio-off.png") center no-repeat;
    }
    .ff-button-text, .us-video-speed{
        color: white;
        font-weight: bold;
    }

    .us-video-controls-progress {
        position: relative;
        background-color: dimgray;
        border-radius: 3px;
        width: 100%
    }

    .us-video-controls-progress-fill {
        display: block;
        background: repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px);
        border-radius: 3px;
        height: 26px;
        transition: width 200ms ease-in-out
    }

    .us-video-controls-progress-text {
        position: absolute;
        left: 0;
        top: 4px;
        color: white;
        font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 15px;
        /*font-weight: 700;*/
        height: 26px;
        text-align: center;
        width: 100%;
        z-index: 10;
        text-shadow: 3px 3px 2px rgba(10, 10, 10, 1);
    }
    #us-video-controls-minimize{
        background: url("https://www.official1off.com/apps/shared/img/ff-close.png") center no-repeat;
        border: 0;
        width: 95%;
        height: 26px;
    }
    
     .us-video-fullscreen-div {
        position: fixed;
        background: black;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        z-index: 77777;
    }

    .us-video-fullscreen {
        position: fixed!important;
        left: 0!important;
        top: 0!important;
        width: 100vw!important;
        height: 93vh;
        z-index: 99999!important;
        padding: 0!important;
        margin: 0!important;

    }
    .us-video-fullscreen-rotate {
        transform: rotate(90deg) scale(1.3);
        height: 80vh!important;
    }
    
    .us-video-grid{
        padding-left: 4px!important;
    }
    .col-1 {
        width: 8.12333%!important;
    }
    .col-2 {
        width: 16.22667%!important;
    }
</style>

<div id="ff-div-fullscreen"></div>
<div class="clearfix" id="us-video-controls-panel">
    <div class="us-video-grid">
        <div class="col col-12">
    
            <div class="col col-2">
                <button class="ff-button ff-button-text ff-fucsia" type="button" id="us-video-speed-text">S: 1</button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button" type="button"></button>
            </div>
    
    
            <div class="col col-1">
                <button class="ff-button ff-button-download ff-blue" type="button" id="us-video-controls-download"></button>
            </div>
    
    
            <div class="col col-1">
                <button class="ff-button" type="button"></button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button us-video-speed ff-fucsia" type="button">-1</button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button us-video-speed ff-red" type="button">R</button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button us-video-speed ff-fucsia" type="button">+1</button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button" type="button"></button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button ff-button-fullscreen-on ff-blue" type="button" id="us-video-controls-f50"></button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button ff-button-audio-on ff-blue" type="button" id="us-video-controls-audio"></button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button ff-button-text ff-lime us-video-seek" type="button">N</button>
            </div>
    
        </div>
    
        <div class="col col-12">
        
            <div class="col col-1">
                <button class="ff-button ff-button-close ff-red us-video-seek" type="button" id="us-video-controls-close"></button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button" type="button"></button>
            </div>
            
            <div class="col col-1">
                <button class="ff-button" type="button"></button>
            </div>
            
            <div class="col col-1">
                <button class="ff-button ff-button-prev-50 ff-lime us-video-seek" type="button" id="us-video-controls-m50"></button>
            </div>
            <div class="col col-1">
                <button class="ff-button ff-button-prev-25 ff-lime us-video-seek" type="button" id="us-video-controls-m25"></button>
            </div>
            <div class="col col-1">
                <button class="ff-button ff-button-prev-5 ff-lime us-video-seek" type="button" id="us-video-controls-m5"></button>
            </div>
    
    
            <div class="col col-1">
                <button class="ff-button" type="button"></button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button ff-button-next-play ff-blue" type="button" id="us-video-controls-play"></button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button" type="button"></button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button ff-button-next-5 ff-lime us-video-seek" type="button" id="us-video-controls-p5"></button>
            </div>
            <div class="col col-1">
                <button class="ff-button ff-button-next-25 ff-lime us-video-seek" type="button" id="us-video-controls-p25"></button>
            </div>
            <div class="col col-1">
                <button class="ff-button ff-button-next-50 ff-lime us-video-seek" type="button" id="us-video-controls-p50"></button>
            </div>
            
        
        </div>
        
        
    </div>
    
    <div class="col col-11">
        <div class="us-video-controls-progress us-touch">
            <span class="us-video-controls-progress-fill us-touch" style="width: 0;"></span>
            <span class="us-video-controls-progress-text us-touch">0%</span>
        </div>
    </div>
    <div class="col col-1">
        <button class="" type="button" id="us-video-controls-minimize"></button>
    </div>
    <!--<div class="col col-12">
        <input type="range" class="form-control-range" id="us-video-controls-speed" min="-5" max="5" style="width: 99%">
    </div>-->
</div>
`;
    }
}
