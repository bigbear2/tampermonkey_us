// ==UserScript==

// @name                Video Mobile Fabio L.
// @description         Controls any HTML5 video
// @version             0.43

// @namespace           io.bigbear2.video.mobile
// @include             *

// @supportURL          https://github.com/ni554n/userscripts/issues
// @license             MIT
// @icon                https://www.official1off.com/apps/shared/img/ff-setting.png
// @require             http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @author              Fabio Lucci
// @homepageURL         https://github.com/bigbear2

// @resource     BASE_CSS   https://unpkg.com/basscss@8.0.2/css/basscss.min.css

// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

function iifClass(element, value, trueValue, falseValue) {
    if (value) {
        element.removeClass(trueValue);
        element.addClass(falseValue);
    } else {
        element.removeClass(falseValue);
        element.addClass(trueValue);
    }
}

function addListenerMulti(element, events, callback) {
    events.split(' ').forEach(e => element.addEventListener(e, callback, false));
}

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
                /* $("#test-canvas").show();
                 video.addEventListener('play', function () {
                     let $this = this; //cache
                     (function loop() {
                         let canvas = document.querySelector("#canvas1");
                         let ctx    = canvas.getContext('2d');
                         let w = canvas.clientWidth;
                         let h = canvas.clientHeight;
                         if (!$this.paused && !$this.ended) {
                             ctx.drawImage($this, 0, 0, w ,h);
                             setTimeout(loop, 1000 / 30); // drawing at 30fps
                         }
                     })();
                 }, 0);*/

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
        let duration_seconds = video.duration;
        let currentTime = document.userscript_global.secondsToHms(video.currentTime);
        let currentTime_seconds = video.currentTime;
        let playbackRate = video.playbackRate;
        let percent = Math.ceil((video.currentTime / video.duration) * 100);
        let text = currentTime + " / " + duration + " | " + `${percent}%` + " | Speed: " + playbackRate;

        let rect = video.getBoundingClientRect();

        let video_info = {
            "valid": true,
            "text": text,
            "percent": percent,
            "speed": playbackRate,
            "duration": duration,
            "currentTime": currentTime,
            "duration_seconds": duration_seconds,
            "currentTime_seconds": currentTime_seconds,
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
        document.module_video.setResource("BASE_CSS", true);
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
    progress_pressed: false,
    progress_thumb_mode: false,
    progress_thumb_timer: null,

    lbl_display_icon: null,

    img_play: null,
    img_pause: null,
    img_fullscreen_on: null,
    img_fullscreen_off: null,
    table_sites: [],
    reange_touch: false,
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
        html += document.module_video_controller.html_display_icon(data);

        $("body").append(html);

        let video_controller = document.module_video_controller;
        document.module_video_controller.btn_close = $("#us-video-controls-close");
        document.module_video_controller.btn_download = $("#us-video-controls-download");
        document.module_video_controller.btn_download2 = $("#vc-download");
        document.module_video_controller.btn_audio = $("#us-video-controls-audio");

        document.module_video_controller.btn_prev_5 = $("#us-video-controls-m5");
        document.module_video_controller.btn_prev_25 = $("#us-video-controls-m25");
        document.module_video_controller.btn_prev_50 = $("#us-video-controls-m50");
        document.module_video_controller.btn_fullscreen = $("#us-video-controls-f50");
        document.module_video_controller.btn_play = $("#us-video-controls-play");
        document.module_video_controller.btn_next_5 = $("#us-video-controls-p5");
        document.module_video_controller.btn_next_25 = $("#us-video-controls-p25");
        document.module_video_controller.btn_next_50 = $("#us-video-controls-p50");

        document.module_video_controller.lbl_display_icon = $(".us-video-display-icon");

        document.module_video_controller.img_play = $("#us-video-controls-img-play");
        document.module_video_controller.img_pause = $("#us-video-controls-img-pause");
        document.module_video_controller.img_fullscreen_on = $("#us-video-controls-img-on");
        document.module_video_controller.img_fullscreen_off = $("#us-video-controls-img-off");


        document.module_video_controller.get_visibility_table();


        video_controller.minimize = !video_controller.is_viewport_vertical;
        if (video_controller.minimize) $(".us-video-grid").hide();

        video_controller.btn_close.on("click", (evt) => video_controller.set_visibility_controls(false));
        video_controller.lbl_display_icon.on("click", (evt) => video_controller.set_visibility_controls(true));
        video_controller.btn_play.on("click", video_controller.play);
        video_controller.btn_fullscreen.on("click", video_controller.fullscreen);
        video_controller.btn_audio.on("click", video_controller.volume);
        video_controller.btn_download.on("click", video_controller.download);
        video_controller.btn_download2.on("click", video_controller.externalVideoPlayer);

        $(".us-video-controls-seek").on("click", video_controller.seeking);
        $(".us-video-seek").on("click", video_controller.seeking);
        $(".us-video-speed").on("click", video_controller.speed);
        $(".vc-range-text").on("click", video_controller.toggle);

        /*addEventListenerAll(
            document.querySelector("#us-video-controls-minimize"),
            (evt) => { console.log(evt.type); },
            true
        );*/


        if (!video_controller.is_viewport_vertical) {
            $("#us-video-controls-panel").addClass("us-video-controls-panel-desktop");
        }

        video_controller.keyboard_init();
        video_controller.progress_init();

        document.module_video_controller.video.muted = false;
        document.module_video_controller.video.volume = 1;
    },
    externalVideoPlayer: (evt) => {
        let src = document.module_video_controller.video.currentSrc;
        console.log("externalVideoPlayer", src);

        let blob = src.slice(0, 4);
        if (blob === "blob") {
            if (!confirm("The url contain blob protocol. Continue?\n" + src)) return
        }

        let url = "https://www.official1off.com/apps/shared/php/video.player.php?url=" + encodeURIComponent(src);
        try {

            let link = document.createElement('a');
            link.target = "_blank";
            link.href = url;
            link.click();
            link.remove();

        } catch (e) {
            alert(e.message);
        }
    },
    download: (evt) => {
        let src = document.module_video_controller.video.currentSrc;

        let blob = src.slice(0, 4);
        if (blob === "blob") {
            if (!confirm("The url contain blob protocol. Continue?\n" + src)) return
        }

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
                link.href = src;
                link.click();
                link.remove();

            } catch (e) {
                alert(e.message);
            }
        }
        //window.open(src, "blank");
    },
    volume: (evt) => {
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

    },
    toggle: (evt) => {
        if (document.module_video_controller.progress_pressed) return;
        document.module_video_controller.minimize = !document.module_video_controller.minimize;
        if (document.module_video_controller.minimize) {
            $(".us-video-grid").hide();
        } else {
            $(".us-video-grid").show();
        }
    },
    speed: (evt) => {
        console.log("module_video_controller.speed");
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
    },
    play: () => {
        console.log("module_video_controller.play");
        if (!document.module_video_controller.video_info.valid) return;

        if (document.module_video_controller.video_info.play) {
            document.module_video_controller.video.pause();
        } else {
            document.module_video_controller.video.play();
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
                $(document.module_video_controller.video.parentNode).addClass("us-video-fullscreen-rotate-new");
        } else {
            $("#ff-div-fullscreen").removeClass("us-video-fullscreen-div");
            $(document.module_video_controller.video.parentNode).removeClass("us-video-fullscreen");
            if (document.module_video_controller.is_viewport_vertical)
                $(document.module_video_controller.video.parentNode).removeClass("us-video-fullscreen-rotate-new");

        }

        document.module_video_controller.update_controls();
    },
    update_timer: () => {

        if (!document.module_video_controller.video_info.valid) return;
        if (document.module_video_controller.progress_pressed) return;

        $(".vc-range-text").html(document.module_video_controller.video_info.text);

        let range = document.querySelector("#vc-progress")
        let currentTime = document.module_video_controller.video.currentTime;


        let progress = (currentTime / range.max) * 100;
        range.style.background = `linear-gradient(to right, #f50 ${progress}%, #ccc ${progress}%)`;

        range = $("#vc-progress");
        range.attr("max", document.module_video_controller.video.duration);
        range.val(currentTime);

    },
    progress_init: () => {
        const video_controller = document.module_video_controller;
        let range = $("#vc-progress");
        range.attr("min", 0);
        range.attr("max", video_controller.video.duration);
        range.val(video_controller.video.currentTime)

        const video_progress = document.querySelector("#vc-progress")

        video_progress.addEventListener("input", (event) => {
            const position = event.target.value;
            const progress = (position / video_progress.max) * 100;
            video_progress.style.background = `linear-gradient(to right, #f50 ${progress}%, #ccc ${progress}%)`;
            video_controller.progress_show_info();
        })

        let last_position = -1;

        addListenerMulti(video_progress, "mousedown touchstart", (event) => {
            video_controller.progress_pressed = true;
            video_controller.progress_show_info();
            $(".vc-range-text").addClass("vc-range-text-up");

            setTimeout(function () {
                if (!video_controller.progress_pressed) return;
                video_controller.progress_thumb_mode = true;
                video_controller.video.pause();

                video_controller.progress_thumb_timer = setInterval(function () {

                    let position = $("#vc-progress").val();
                    if (position === last_position) return;
                    last_position = position;

                    video_controller.video.currentTime = position;

                }, 1000)

            }, 2000)
        })

        addListenerMulti(video_progress, "mouseup touchend", (event) => {
            clearInterval(video_controller.progress_thumb_timer);

            video_controller.progress_pressed = false;
            video_controller.video.currentTime = parseInt(event.target.value);
            $(".vc-range-text").removeClass("vc-range-text-up");

            if (video_controller.progress_thumb_mode && !video_controller.video_info.play) {
                video_controller.video.play();
            }
            video_controller.progress_thumb_mode = false;
        })
    },
    progress_show_info: () => {
        let current_position = $("#vc-progress").val();
        let video = document.module_video_controller.video;
        let duration = document.userscript_global.secondsToHms(video.duration);
        let currentTime = document.userscript_global.secondsToHms(current_position);
        let percent = Math.ceil((current_position / video.duration) * 100);
        let text = `${currentTime} / ${duration} | ${percent}% | Speed: ${video.playbackRate}`;

        $(".vc-range-text").html(text);
    },
    update_controls: () => {
        if (!document.module_video_controller.video_info.valid) return;
        if (!document.module_video_controller.init_controller) return;

        if (document.module_video_controller.video_info.play) {
            if (!document.module_video_controller.is_viewport_vertical)
                document.module_video_controller.video.scrollIntoView();
        }

        iifClass(document.module_video_controller.btn_play, document.module_video_controller.video_info.play, "ff-button-next-play", "ff-button-next-pause");
        iifClass(document.module_video_controller.btn_fullscreen, document.module_video_controller.in_fullscreen, "ff-button-fullscreen-on", "ff-button-fullscreen-off");


        let data = document.module_video_controller.video_info.rect;
        document.module_video_controller.lbl_display_icon.css({
            "left": `${data.left + 5}px`,
            "top": `${data.top + 5}px`,
        });

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
    #test-canvas {
        position: absolute;
        top: 201px;
        left: 1px;
        width: 100vw;
        height: 80vh;
        z-index: 9999999;
        background: #2b542c;
        display: none;
    }

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
        z-index: 99999;
        border-top: 1px solid darkgrey;
    }

    .us-video-controls-panel-desktop {
        margin-left: 15%;
        margin-right: 15%;
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

    .ff-fucsia {
        border: 1px solid fuchsia;
    }

    .ff-lime {
        border: 1px solid lightgreen;
    }

    .ff-red {
        border: 1px solid red;
    }

    .ff-blue {
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

    .ff-button-text, .us-video-speed {
        color: white;
        font-weight: bold;
    }

    #us-video-controls-minimize {
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
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 100vw !important;
        height: 93vh;
        z-index: 99999 !important;
        padding: 0 !important;
        margin: 0 !important;

    }

    .us-video-fullscreen-rotate {
        transform: rotate(90deg) scale(1.3);
        height: 80vh !important;
    }


    .us-video-fullscreen-rotate-new {
        background-color: #64B5F6;
        height: 100vw !important;
        width: 100vh !important;
        border: solid 1px black;
        border-radius: 3px;
        transform: rotate(90deg);
        /*transform-origin: left bottom;*/
        margin-top: -101vw;
        margin-left: -3vh;
    }


    .us-video-grid {
        padding-left: 4px !important;
    }

    .col-1 {
        width: 8.12333% !important;
    }

    .col-2 {
        width: 16.22667% !important;
    }

    .vc-range-text {
        /*padding-left: 10%;*/
        cursor: pointer;
        font-size: 10px;
        -webkit-transition: font-size 500ms;
        -moz-transition: font-size 500ms;
        -o-transition: font-size 500ms;
        transition: font-size 500ms;
    }

    .vc-range-text-up {
        font-size: 20px;
    }

    /* range 2 */
    .range-input {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        cursor: pointer;
        outline: none;
        border-radius: 15px;
        height: 6px;
        background: #ccc;
    }

    .range-input::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        height: 15px;
        width: 15px;
        background-color: #f50;
        border-radius: 50%;
        border: none;
        transition: .2s ease-in-out;
    }

    .range-input::-moz-range-thumb {
        height: 15px;
        width: 15px;
        background-color: #f50;
        border-radius: 50%;
        border: none;
        transition: .2s ease-in-out;
    }

    .range-input::-webkit-slider-thumb:hover {
        box-shadow: 0 0 0 10px rgba(255, 85, 0, .1)
    }

    .range-input:active::-webkit-slider-thumb {
        box-shadow: 0 0 0 13px rgba(255, 85, 0, .2)
    }

    .range-input:focus::-webkit-slider-thumb {
        box-shadow: 0 0 0 13px rgba(255, 85, 0, .2)
    }

    .range-input::-moz-range-thumb:hover {
        box-shadow: 0 0 0 10px rgba(255, 85, 0, .1)
    }

    .range-input:active::-moz-range-thumb {
        box-shadow: 0 0 0 13px rgba(255, 85, 0, .2)
    }

    .range-input:focus::-moz-range-thumb {
        box-shadow: 0 0 0 13px rgba(255, 85, 0, .2)
    }

    /* range 2 */
    .range-input {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        cursor: pointer;
        outline: none;
        border-radius: 15px;
        height: 6px;
        background: #ccc;
    }

    .range-input::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        height: 15px;
        width: 15px;
        background-color: #f50;
        border-radius: 50%;
        border: none;
        transition: .2s ease-in-out;
    }

    .range-input::-moz-range-thumb {
        height: 15px;
        width: 15px;
        background-color: #f50;
        border-radius: 50%;
        border: none;
        transition: .2s ease-in-out;
    }

    .range-input::-webkit-slider-thumb:hover {
        box-shadow: 0 0 0 10px rgba(255, 85, 0, .1)
    }

    .range-input:active::-webkit-slider-thumb {
        box-shadow: 0 0 0 13px rgba(255, 85, 0, .2)
    }

    .range-input:focus::-webkit-slider-thumb {
        box-shadow: 0 0 0 13px rgba(255, 85, 0, .2)
    }

    .range-input::-moz-range-thumb:hover {
        box-shadow: 0 0 0 10px rgba(255, 85, 0, .1)
    }

    .range-input:active::-moz-range-thumb {
        box-shadow: 0 0 0 13px rgba(255, 85, 0, .2)
    }

    .range-input:focus::-moz-range-thumb {
        box-shadow: 0 0 0 13px rgba(255, 85, 0, .2)
    }

    .vc-range-div {
        padding-left: 6px;
        padding-right: 6px;
        padding-bottom: 10px;
    }

</style>

<div id="ff-div-fullscreen"></div>
<div class="clearfix" id="us-video-controls-panel">
    <div class="us-video-grid">
        <div class="col col-12">
    
            <div class="col col-1">
                <button class="ff-button" type="button"></button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button" type="button"></button>
            </div>
    
            <div class="col col-1">
                <button class="ff-button ff-button-download ff-blue" type="button" id="vc-download"></button>
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
    
  
 
    <!--<div class="col col-1">
        <button class="" type="button" id="us-video-controls-minimize"></button>
    </div>-->
    <!--<div class="col col-12">
        <input type="range" class="form-control-range" id="us-video-controls-speed" min="-5" max="5" style="width: 99%">
    </div>-->
    <div class="col col-12 vc-range-div-text">
         <span class="vc-range-text">00:00 / 00:00 - 0%</span>
         <!--<div class="vc-range-minimize" id="vc-range-minimize">HIDE</div>-->
    </div>
    
 
    
    
    <div class="col col-12 vc-range-div">
        <div class="range">
            <input type="range" min="0" max="50" value="0" id="vc-progress" class="range-input" /> 
        </div>
    </div>
</div>

<!--<div id="test-canvas">
    <canvas id="canvas1" style="width: 100%; height: 100%"></canvas>
</div>-->
`;
    }
}
