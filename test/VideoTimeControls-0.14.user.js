// ==UserScript==
// @name         VideoTimeControls
// @namespace    http://tampermonkey.net/
// @version      0.44
// @description  VideoTimeControls
// @author       bigbear2sfc
// @match        https://spankbang.com/*
// @match        https://www.analgalore.com/*
// @match        https://www.eporner.com/*
// @match        https://www.findtubes.com/*
// @match        https://www.fuq.com/*
// @match        https://www.pornhub.com/*
// @match        https://www.redtube.com/*
// @match        https://www.xnxx.com/*
// @match        https://www.xvideos.com/*
// @match        https://xhamster.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lovenselife.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

'use strict';


const emoji_error = "\u{1F4A2}";
const emoji_info = "ℹ️ℹ️";
var is_initialize = false;
var element_video = [];
var universal_parent_count = 5;
const time_colors = ['white', 'white', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF'];

/*
console.log('📕: error message');
console.log('📙: warning message');
console.log('📗: ok status message');
console.log('📘: action message');
console.log('📓: canceled status message');
console.log('📔: Or anything you like and want to recognize immediately by color');
*/

const IOK = '📗';
const IERROR = '📕';
const IWARNING = '📘';

function errorLog(...args) {
    console.debug('📙 ERROR', args);
}


function debugLog(...args) {

    [].push.call(args, '📗 DEBUG');
    console.debug(args);

}

function infoLog(...args) {

    [].push.call(args, '📘 INFO');
    console.debug(args);

}

function evalTwo(value) {
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", "url to the script file here");
    document.getElementsByTagName("head")[0].appendChild(script);
}

document.mobileAndTabletCheck = function () {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

document.module_xhamster = {
    data: [],
};

document.get_xhamster_search = function () {
    console.debug(IOK + 'get_xhamster_search');

    let modulo = document.module_xhamster;
    document.userscript_global.getValue("xhamster_search", "[]", (resp) => {
        resp = JSON.parse(resp);
        modulo.data = JSON.parse(resp.data);
        //console.debug(IOK + 'get_xhamster_search', modulo.data);

        setTimeout(() => document.set_xhamster_search(), 1000);
    });
}

document.set_xhamster_search = function () {
    if ((window.location.href.indexOf("/tags/") == -1) && (window.location.href.indexOf("/search/") == -1)) return;
    console.debug(IOK + 'set_xhamster_search');

    let collection = document.getElementsByClassName("thumb-list__item");
    let xhamster_search = [];
    for (let i = 0; i < collection.length; i++) {
        let elm = collection[i];
        elm = elm.querySelector(".video-thumb__image-container")
        let href = elm.href;
        xhamster_search.push(href);
    }
    document.userscript_global.setValue("xhamster_search", xhamster_search);
    //console.debug(IOK, xhamster_search);


};


const elementIsVisibleInViewport = (el, partiallyVisible = false) => {
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    return partiallyVisible
        ? ((top > 0 && top < innerHeight) ||
            (bottom > 0 && bottom < innerHeight)) &&
        ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
        : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};


function getElementByText(tag, text, partial = true, caseInsensitive = true) {
    let aTags = document.getElementsByTagName(tag);
    let found = null;

    if (caseInsensitive) text = text.toLowerCase();

    for (var i = 0; i < aTags.length; i++) {
        let text_elm = aTags[i].textContent;
        if (caseInsensitive) text_elm = text_elm.toLowerCase();

        if (partial) {
            if (text_elm.includes(text)) found = aTags[i];
        } else {
            if (text_elm == text) found = aTags[i];
        }

    }
    return found;
}


function timeToSeconds(value) {
    let a = value.split(":").reverse();
    let seconds = parseInt(a[0]);
    if (a.length > 1) seconds = seconds + (parseInt(a[1]) * 60);
    if (a.length > 2) seconds = seconds + (parseInt(a[2]) * 3600);
    return parseInt(seconds);
}

function typeTime(value, split = true) {
    let min = value;
    if (split) {
        let a = value.split(":");
        if (a.length > 2) {
            return 4;
        } else {
            min = parseInt(a[0]);
        }
    }
    min = parseInt(min);
    if (min >= 0 && min < 5) return 0;
    if (min >= 5 && min < 10) return 1;
    if (min >= 10 && min < 20) return 2;
    if (min >= 20 && min < 30) return 3;
    if (min >= 30) return 4;
    return 4;
}

function spankbangColorizeTime() {
    //debugLog("spankbangColorizeTime");
    const collection = document.querySelectorAll(".video-badge");
    for (let i = 0; i < collection.length; i++) {
        try {
            let elm = collection[i];
            let text = elm.innerText;


            if (text.indexOf("HD") > -1) continue;

            if (text.indexOf("m") == -1) {
                if (text.indexOf("s") == -1) continue;
            }


            text = text.replace("m", "");
            text = text.replace("s", "");

            text = parseInt(text);
            let t_time = typeTime(text, false);
            let time = text * 60;

            //console.debug(text, t_time, time);

            let item = elm.parentNode.parentNode;
            let record = {
                "element": item,
                "seconds": time,
                "time": text,
            }
            item.classList.add("us-watched-min-" + t_time.toString());
            element_video.push(record);

            if (elm.style.fontSize === "20px") continue;

            elm.style.fontSize = "20px";
            elm.style.color = time_colors[t_time];


        } catch (error) {
            errorLog("spankbangColorizeTime", error);
        }

    }


}

function hentaicityColorizeTime() {
    //debugLog("hentaicityColorizeTime");
    const collection = document.querySelectorAll(".time");
    for (let i = 0; i < collection.length; i++) {
        try {
            let elm = collection[i];
            let text = elm.innerText;


            let t_time = typeTime(text, true);
            let time = timeToSeconds(text);


            let item = elm.parentNode.parentNode.parentNode;
            let record = {
                "element": item,
                "seconds": time,
                "time": text,
            }
            item.classList.add("us-watched-min-" + t_time.toString());
            element_video.push(record);

            if (elm.style.fontSize === "20px") continue;

            elm.style.fontSize = "20px";
            elm.style.color = time_colors[t_time];


        } catch (error) {
            errorLog("hentaicityColorizeTime", error);
        }

    }


}

function epornerColorizeTime() {
    //debugLog("epornerColorizeTime");
    const collection = document.querySelectorAll(".mbtim");
    for (let i = 0; i < collection.length; i++) {
        try {
            let elm = collection[i];
            let text = elm.innerText;


            let t_time = typeTime(text, true);
            let time = timeToSeconds(text);


            let item = elm.parentNode.parentNode.parentNode;
            let record = {
                "element": item,
                "seconds": time,
                "time": text,
            }
            item.classList.add("us-watched-min-" + t_time.toString());
            element_video.push(record);

            if (elm.style.fontSize === "20px") continue;

            elm.style.fontSize = "20px";
            elm.style.color = time_colors[t_time];


        } catch (error) {
            errorLog("epornerColorizeTime", error);
        }

    }


}

function redtubeColorizeTime() {
    //debugLog("redtubeColorizeTime");
    const collection = document.querySelectorAll(".tm_video_duration");
    for (let i = 0; i < collection.length; i++) {
        try {
            let elm = collection[i];
            let text = elm.innerText.trim();
            let t_time = typeTime(time, true);

            let time = timeToSeconds(text);
            let color = time_colors[t_time];

            let item = elm.parentNode.parentNode.parentNode.parentNode.parentNode;
            let record = {
                "element": item,
                "seconds": time * 60,
                "time": time,
            }
            item.classList.add("us-watched-min-" + t_time.toString());
            element_video.push(record);

            if (elm.style.fontSize === "20px") continue;

            elm.style.color = time_colors[t_time];

            item.classList.add("us-watched-min-" + t_time.toString());
            elm.style.fontSize = "20px";


        } catch (error) {
            errorLog("redtubeColorizeTime", error);
        }

    }


}

function xvideosColorizeTime() {

    let marked = 0;
    const collection = document.getElementsByClassName("duration");
    for (let i = 0; i < collection.length; i++) {
        try {
            let elm = collection[i];
            let text = elm.innerText;
            let time = 0;

            if (text.indexOf("min") > -1) {

                text = text.replace(" min", "");
                text = text.trim();
                if (text.indexOf("h") > -1) {
                    let a_text = text.split(" h ");
                    time = parseInt(a_text[1] + (parseInt(a_text[0] * 60)));
                } else {
                    time = parseInt(text);
                }

            } else {
                time = 1;
            }

            let t_time = typeTime(time, false);

            let item = elm.parentNode.parentNode.parentNode.parentNode;
            let record = {
                "element": item,
                "seconds": time * 60,
                "time": time,
            }
            item.classList.add("us-watched-min-" + t_time.toString());
            element_video.push(record);

            if (!elm.classList.contains("us-video-min-global")) {
                elm.classList.add("us-video-min-global");
                elm.classList.add("us-video-min-" + t_time.toString());
            }
            /* if (elm.style.fontSize === "20px") continue;
            elm.style.fontSize = "20px";
            elm.style.color = time_colors[t_time]; */

            marked++;

        } catch (error) {
            errorLog("xvideosColorizeTime", error);
        }

    }

}

function xnxxColorizeTime() {
    //debugLog("xnxxColorizeTime");
    const collection = document.querySelectorAll("p.metadata");
    for (let i = 0; i < collection.length; i++) {
        try {
            let elm = collection[i];
            let text = elm.innerText;

            if (text.indexOf("min") == -1) continue;

            if (elm.innerHTML.indexOf("mycolor") > -1) continue;

            text = text.split(" ")[1];
            text = text.split("min")[0];
            text = text.trim();

            let time = parseInt(text);
            let t_time = typeTime(time, false);
            let color = time_colors[t_time];

            let item = elm.parentNode.parentNode;
            let record = {
                "element": item,
                "seconds": time * 60,
                "time": time,
            }
            item.classList.add("us-watched-min-" + t_time.toString());
            element_video.push(record);

            if (elm.style.fontSize === "20px") continue;

            let span = `<span class="mycolor" style='color: ${color}; font-size: 20px;'>${text} min</span>`;
            text += "min";
            elm.innerHTML = elm.innerHTML.replace(text, span)


        } catch (error) {
            errorLog("xnxxColorizeTime", error);
        }

    }


}

 
function fuqColorizeTime() {
    debugLog("fuqColorizeTime");
    const collection = document.querySelectorAll("span.badge.badge-solid.text-sm.rounded.float-right");

    let count = 0;

    for (let i = 0; i < collection.length; i++) {
        try {
            let elm = collection[i];
            //elm = elm.parentNode.parentNode.querySelector(".grid-flow-col");

            let text = elm.innerText;

            text = text.replace("HD", "");
            text = text.replace("VR", "");
            text = text.trim();

            let time = timeToSeconds(text);
            let t_time = typeTime(text, true);

            let item = elm.parentNode.parentNode.parentNode;
            let record = {
                "element": item,
                "seconds": time * 60,
                "time": time,
            }
            item.classList.add("us-watched-min-" + t_time.toString());
            element_video.push(record);

            if (elm.style.fontSize === "20px") continue;

            elm.style.color = time_colors[t_time];
            item.classList.add("us-watched-min-" + t_time.toString());
            elm.style.fontSize = "20px";

            //console.log(time)

        } catch (error) {
            console.log(error.message)
        }
        count++;
    }

    if (count > 0) {
        document.us_fuq.fixTitles();
        //us_highlight.execute();
    }

    debugLog("fuqColorizeTime", count);
}

function xHamsterColorizeTime() {


    let ifrm = document.querySelector("iframe");
    if (ifrm !== null) ifrm.remove();

    let items_count = 0;
    document.us_vtc.showMoreButton();


    const collection = document.getElementsByClassName("thumb-image-container__duration");
    for (let i = 0; i < collection.length; i++) {
        let elm;

        if (collection[i].childElementCount < 2) {
            elm = collection[i].children[0];
        } else {
            elm = collection[i].children[1];
        }

        let time = collection[i].innerText;

        if (time.indexOf(":") === -1) continue;

        let time_seconds = timeToSeconds(time);
        let item = elm.parentNode.parentNode.parentNode.parentNode;

        let record = {
            "element": item,
            "seconds": time_seconds,
            "time": time,
        }
        element_video.push(record);

        let t_time = typeTime(time);
        elm = elm.firstChild;

        if (!elm.classList.contains("us-video-min-global")) {
            elm.classList.add("us-video-min-global");
            elm.classList.add("us-video-min-" + t_time.toString());
        } else {
            continue;
        }


        //if (elm.style.fontSize === "20px") continue;

        items_count++;
        /* elm.style.color = time_colors[t_time];
        elm.style.fontSize = "20px"; */
        item.classList.add("us-watched-min-" + t_time.toString());


        try {
            elm = elm.parentElement.parentElement.parentElement;
            elm = elm.querySelector(".thumb-image-container__watched");
            if (elm !== null) {

                elm.firstChild.style.color = "rgb(0, 255, 255)";
                elm.firstChild.style.fontSize = "16px";
                let sheet = elm.parentNode.parentNode.parentNode;
                let parent = sheet.parentNode;
                sheet.style.opacity = 0.5;
                sheet.classList.add("us-watched");

            }
        } catch (error) {
            errorLog("xHamsterColorizeTime", error);
        }

    }

    if (items_count > 0) {
        //us_highlight.execute();

        document.us_vtc.is_change_filter = true;
        document.us_vtc.applyFilter();
        let container = document.querySelector(".videos");
        if (container === null) return;
        container.style.zoom = 1.2

    }

}

function durationColorizeTime() {
    //debugLog("durationColorizeTime");
    let count = 0;

    const collection = document.getElementsByClassName("duration");
    for (let i = 0; i < collection.length; i++) {
        let elm = null;

        if (document.us_vtc.is_pornhub) {
            elm = collection[i];
        } else {
            if (collection[i].childElementCount < 2) {
                elm = collection[i].children[0];
            } else {
                elm = collection[i].children[1];
            }
        }

        if (elm == undefined) continue;

        if (document.us_vtc.is_pornhub) {
            if (elm.style.textAlign === "center") continue;
        }

        let time = collection[i].innerText;
        time = time.replace("1080p", "").replace("720p", "").trim();
        time = time.replace("HD", "");
        time = time.trim();

        if (time.indexOf(":") == -1) continue;

        let time_seconds = 0;
        let t_time = typeTime(time);
        try {
            time_seconds = timeToSeconds(time);

        } catch (error) {
            errorLog("ERRORE timeToSeconds", error);
            return;
        }

        let item = elm.parentNode.parentNode.parentNode.parentNode.parentNode;
        let record = {
            "element": item,
            "seconds": time_seconds,
            "time": time,
        }
        element_video.push(record);

        elm.style.color = time_colors[t_time];
        item.classList.add("us-watched-min-" + t_time.toString());

        if (!elm.classList.contains("us-video-min-global")) {
            elm.classList.add("us-video-min-global");
            elm.classList.add("us-video-min-" + t_time.toString());
        } else {
            continue;
        }

        /* elm.style.fontSize = "20px";
        elm.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        elm.style.padding = '4px';
        elm.style.borderRadius = '6px'; */

        if (document.us_vtc.is_pornhub) {
            elm.setAttribute("style", "font-size: 18px!important;width: 80px;text-align: center;");
            //elm.style.width = "90px";
            //elm.style.textAlign = "center";
            //elm.style.transform = 'scale(1.2,1.2)';

            let iText = item.innerText;
            if (iText.includes("WATCHED")) {
                item.style.opacity = 0.5;
                item.classList.add("us-watched");
            }
        }

    }

}

function universalColorizeTime() {

    let count = 0;
    let selectorID = document.us_vtc.is_groups_global_selector;
    //debugLog(IWARNING + "universalColorizeTime", selectorID);

    const collection = document.querySelectorAll(selectorID);
    for (let i = 0; i < collection.length; i++) {
        let elm = collection[i];

        if (elm == undefined) continue;
        item = elm;
        for (let x = 0; x < document.us_vtc.is_groups_global_parent; x++) item = item.parentNode;

        let tmp = item.innerText;
        if (tmp.indexOf("No video available") > -1) {
            item.remove();
            continue;
        }

        let time_text = collection[i].innerText.toLowerCase();

        time_text = time_text.replace("1080p", "").replace("720p", "").trim();
        time_text = time_text.replace("hd", "").replace("vr", "").trim();
        time_text = time_text.replace("4k", "").trim();
        time_text = time_text.trim();

        let type_format = "";
        if (time_text.indexOf("min") > -1) type_format = "m"
        if (time_text.indexOf(":") > -1) type_format = ":"
        if (type_format == "") continue;

        count++;

        type_format = (type_format == ":");

        let time_seconds = 0;
        let t_time = typeTime(time_text, type_format);

        try {
            time_seconds = timeToSeconds(time_text);

        } catch (error) {
            errorLog("ERRORE timeToSeconds", error);
            continue;
        }

        if (!elm.classList.contains("us-video-min-global")) {
            elm.classList.add("us-video-min-global");
            elm.classList.add("us-video-min-" + t_time.toString());
        } else {
            continue;
        }


        //let item = elm.parentNode.parentNode.parentNode.parentNode.parentNode;
        let record = {
            "element": item,
            "seconds": time_seconds,
            "time": time_text,
        }
        element_video.push(record);

        item.classList.add("us-watched-min-" + t_time.toString());

        /* elm.style.color = time_colors[t_time];            
        elm.style.fontSize = "20px";
        elm.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        elm.style.padding = '4px';
        elm.style.borderRadius = '6px'; */

    }

    if (count > 0) {
        //document.us_fuq.fixTitles();
        //us_highlight.execute();
    }
    //console.debug(IWARNING, element_video);
    //debugLog(IWARNING + "universalColorizeTime Count", count);

}



function startColorizeTime(l) {
    colorizeTime();
    setInterval(function () {
        colorizeTime();
    }, 10000);
}
function decodeAndExtractLink(base64String) {
    // Decodifica della stringa base64
    const decodedString = atob(base64String);

    // Regex per trovare un link HTTP o HTTPS
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = decodedString.match(urlRegex);

    // Se trova un link, lo restituisce, altrimenti restituisce un messaggio
    return match ? match[0] : 'Nessun link trovato';
}

document.us_fuq = {
    is_init: false,
    fixTitles: () => {
        let me = document.us_fuq;
        if (me.is_init) return;
        me.is_init = true;

        const style = document.createElement('style');
        style.innerHTML = `
            .item-title-ex {
                text-overflow: unset! important;
                white-space: unset! important;
            }`;
        document.body.appendChild(style);
        const divElements = document.querySelectorAll('a.item-title.item-link.rate-link.font-medium');
        divElements.forEach(div => {
            div.classList.add('item-title-ex');
        });
    },
    init: () => {
        document.us_fuq.initFix()
        let collection = document.querySelectorAll(".item-link");
        for (let i = 0; i < collection.length; i++) {
            let elm = collection[i];
            let href = elm.href;
            if (href.indexOf("/out/?") == -1) continue;
            console.debug(href);
            href = href.replace("https://www.analgalore.com/out/?l=", "");
            href = href.split("&")[0];
            console.debug(href.split("/"));
            href = href.split("/")[1];
            let decode_href = document.us_fuq.decodeAndExtractLink(href);
            console.debug(href, decode_href);
        }
    },
    filterPrintableChars: (str) => {
        let result = '';
        for (let char of str) {
            const code = char.charCodeAt(0);
            if (code < 32 || code > 126) break;
            result += char;
        }
        return result;
    },
    fromBinary: (encoded) => {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    },
    decodeAndExtractLink: (base64String) => {
        const decodedString = atob(base64String);
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const match = decodedString.match(urlRegex);
        let val = match ? match[0] : '';
        return document.us_fuq.filterPrintableChars(val);
    }
}

const c_host = window.location.host;
const groups_fuq = ['www.fuq.com', 'www.analgalore.com', 'www.findtubes.com'];
const groups_global = ['pornloupe.com', 'www.analgalore.com'];
const is_this_host = (value) => { return (window.location.host.indexOf(value) > -1) };

document.us_vtc = {
    is_autoplay: false,
    zoom_14: ['4kporn.xxx', 'fapnfuck.com', 'b1gtits.com'],
    zoom_12: ['www.fuq.com', 'www.fucd.com'],
    is_xvideos: (window.location.host.indexOf('xvideos.com') > -1),
    is_redtube: (window.location.host == 'www.redtube.com'),
    is_xnxx: (window.location.host == 'www.xnxx.com'),
    is_pornhub: (window.location.host.indexOf('pornhub.com') > -1),
    is_xhamster: is_this_host('xhamster.'),
    is_eporner: (window.location.host.indexOf('.eporner.com') > -1),
    is_spankbang: (window.location.host.indexOf('spankbang.com') > -1),
    is_groups_fuq: groups_fuq.includes(c_host),
    is_hentaicity: (window.location.host.indexOf('hentaicity.com') > -1),
    is_groups_global: groups_global.includes(c_host),
    is_groups_global_idx: groups_global.indexOf(c_host),
    is_groups_global_selector: ['.time-holder', "span.item-meta-container > span:nth-child(2)"],
    is_groups_global_parent: [5, 3],
    fnColorizeTime: null,
    is_change_filter: true,
    on_apply_filter: false,
    is_init: false,
    filter_duration_elm_0: null,
    filter_duration_elm_1: null,
    filter_duration_elm_2: null,
    filter_duration_elm_3: null,
    filter_duration_elm_4: null,
    filter_watched_elm: null,
    video_container: null,
    video_container_class: false,
    init: () => {
        //debugLog("us_vtc INIT", document.us_vtc.is_init);
        let me = document.us_vtc;
        if (document.us_vtc.is_init) return;
        document.us_vtc.is_init = true;

        /* me.is_groups_fuq = me.is_groups_fuq.indexOf(window.location.host) > -1;
        me.is_groups_global_idx = me.is_groups_global.indexOf(window.location.host);
        me.is_groups_global = me.is_groups_global.indexOf(window.location.host) > -1; */


        if (document.us_vtc.is_xvideos) document.us_vtc.fnColorizeTime = xvideosColorizeTime;
        if (document.us_vtc.is_redtube) document.us_vtc.fnColorizeTime = redtubeColorizeTime;
        if (document.us_vtc.is_eporner) document.us_vtc.fnColorizeTime = epornerColorizeTime;
        if (document.us_vtc.is_xnxx) document.us_vtc.fnColorizeTime = xnxxColorizeTime;
        if (document.us_vtc.is_hentaicity) document.us_vtc.fnColorizeTime = hentaicityColorizeTime;
        if (document.us_vtc.is_xhamster) document.us_vtc.fnColorizeTime = xHamsterColorizeTime;
        if (document.us_vtc.is_pornhub) document.us_vtc.fnColorizeTime = durationColorizeTime;
        if (me.is_groups_fuq) document.us_vtc.fnColorizeTime = fuqColorizeTime;
        if (document.us_vtc.is_spankbang) document.us_vtc.fnColorizeTime = spankbangColorizeTime;


        if (me.is_groups_global) {
            me.is_groups_global_selector = me.is_groups_global_selector[me.is_groups_global_idx];
            me.is_groups_global_parent = me.is_groups_global_parent[me.is_groups_global_idx];
            document.us_vtc.fnColorizeTime = universalColorizeTime;
            document.us_fuq.fixTitles();
        }


        let host = window.location.host;
        let body = document.querySelector("body");
        if (!document.mobileAndTabletCheck()) {
            //if (me.zoom_14.includes(host)) body.style.zoom = "1.2";
            //if (me.zoom_12.includes(host)) body.style.zoom = "1.2";
        }

        me.autoplay();

        if (document.us_vtc.fnColorizeTime === null) return;

        if (window.location.href.indexOf('xvideos.com/video') > -1) {
            me.video_container = document.querySelector("#content");
        }

        let embed_1 = document.location.href.indexOf("/embed/") > -1;
        let embed_2 = document.location.href.indexOf("/embedframe/") > -1;

        let embed = (embed_1 || embed_2);
        if (!embed) {
            document.us_vtc.addMenu();
            document.us_vtc.loadFilter();
        }

        if (document.us_vtc.is_xhamster) {
            document.get_xhamster_search();
            document.us_vtc.enlargeContains();
        }

        if (embed) return;

        //debugLog("STAR COLORIZE");
        document.us_vtc.fnColorizeTime();

        document.us_vtc.applyFilter();
        setInterval(() => {
            document.us_vtc.applyFilter();
        }, 10000)

        //if (document.us_vtc.is_xhamster) {
        setTimeout(() => {
            document.us_vtc.removeBanner();
            document.us_vtc.enlargeVideoPlayer();
        }, 2000)
        //}

        if (!document.us_vtc.is_groups_fuq) {
            document.us_fuq.fixTitles();
            setInterval(function () {
                document.us_vtc.fnColorizeTime();
            }, 10000);
        }


        if (me.video_container !== null) {
            return;
            document.addEventListener("scrollend", (event) => {
                let visible = elementIsVisibleInViewport(me.video_container);
                if (visible) {
                    if (me.video_container_class) {
                        me.video_container_class = false;
                        me.video_container.classList.remove("us_vtc_show_video");
                    }
                } else {
                    if (!me.video_container_class) {
                        me.video_container_class = true;
                        me.video_container.classList.add("us_vtc_show_video");
                    }
                }
                //debugLog("SCROOL END", visible, me.video_container_class);
            });

        }

    },
    addMenu: () => {
        let obj_css = `
            <style>
                #us_vtc_filter {
                    -webkit-box-shadow: 5px 5px 15px 5px #000000!important;
                    box-shadow: 5px 5px 15px 5px #000000!important;
                    background-color: #282828!important;
                    position: fixed;
                    padding: 4px;
                    width: 160px;
                    color: white! important;
                    text-decoration: none;
                    font-size: 14px !important;
                    border-radius: 0 5px 5px 0;
                    z-index: 99999;
                    left: -145px;
                    bottom: 30%;
                    opacity: 0.4;
                    filter: alpha(opacity=30);
                    transition: 0.3s;
                }



                #us_vtc_filter:hover {
                    opacity: 1.0;
                    filter: alpha(opacity=100);
                    transition: 0.3s;
                    left: 0px;
                }

                #us_vtc_filter > form > label {
                    font-size: 14px !important;
                }

                #us_vtc_filter > form > button {
                    font-size: 14px !important;
                    padding: 2px;
                    background-color: grey !important;
                    color: black !important;
                    width: 100%;
                    margin: 2px;
                }
                .us_vtc_filter_hide{
                    display: none !important;
                }

                .us_vtc_show_video{
                    position: fixed!important;
                    top: 0!important;
                    left: 10px!important;
                    right: 10px!important;
                    z-index: 999999!important;
                }

                .us-video-min-global {
                    margin-top: -5px !important;
                    background-color: rgba(0, 0, 0, 0.7) !important;
                    font-size: 18px !important;
                    padding: 4px !important;
                    border-radius: 3px !important;
                }
                .us-video-min-0{
                    color: white !important;
                }
                .us-video-min-1{
                    color: rgb(216, 240, 84) !important;
                }
                .us-video-min-2{
                    color: rgb(89, 241, 84) !important;
                }
                .us-video-min-3{
                    color: rgb(247, 104, 104) !important;
                }
                .us-video-min-4{
                    color: rgb(52, 240, 199) !important;
                }
                .us-video-min-5{
                    color: rgb(89, 74, 228) !important;
                }
            </style>`;

        document.head.insertAdjacentHTML("beforeend", obj_css);

        let obj_html = `
           <div id="us_vtc_filter">
                <form action="#">
                    <input type="checkbox" id="us_vtc_filter_op_0" class="us_vtc_filter" name="us_vtc_filter_op_0" value="0"
                           checked>
                    <label for="us_vtc_filter_op_0">Show 0 < 5 Min</label><br>

                    <input type="checkbox" id="us_vtc_filter_op_1" class="us_vtc_filter" name="us_vtc_filter_op_1" value="1"
                           checked>
                    <label for="us_vtc_filter_op_1">Show 5 < 10 Min</label><br>

                    <input type="checkbox" id="us_vtc_filter_op_2" class="us_vtc_filter" name="us_vtc_filter_op_2" value="2"
                           checked>
                    <label for="us_vtc_filter_op_2">Show 10 < 20 Min</label><br>

                    <input type="checkbox" id="us_vtc_filter_op_3" class="us_vtc_filter" name="us_vtc_filter_op_3" value="3"
                           checked>
                    <label for="us_vtc_filter_op_3">Show 20 < 30 Min</label><br>

                    <input type="checkbox" id="us_vtc_filter_op_4" class="us_vtc_filter" name="us_vtc_filter_op_4" value="4"
                           checked>
                    <label for="us_vtc_filter_op_4">Show > 30 Min</label><br>

                    <input type="checkbox" id="us_vtc_filter_op_5" class="us_vtc_filter" name="us_vtc_filter_op_5" value="10"
                           checked>
                    <label for="us_vtc_filter_op_5">Show Watched</label><br><br>

                    <button type="button" value="11" class="us_vtc_filter">Search Title</button>
                    <button type="button" value="12" class="us_vtc_filter">Search Similar</button>
                    <button type="button" value="13" class="us_vtc_filter">Search Tags</button>
                    <button type="button" value="14" class="us_vtc_filter">NOISE</button>
                    <button type="button" value="15" class="us_vtc_filter">Colorize</button>
                    <button type="button" value="16" class="us_vtc_filter">Close</button>
                </form>
            </div>`;


        document.body.insertAdjacentHTML("beforeend", obj_html);

        const checkboxes = document.querySelectorAll(".us_vtc_filter");
        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].addEventListener("click", (evt) => {
                //debugLog("CHECKBOX FILTER CLICK", evt);
                document.us_vtc.filter(evt);
            });
        }

        document.us_vtc.filter_duration_elm_0 = document.querySelector("#us_vtc_filter_op_0");
        document.us_vtc.filter_duration_elm_1 = document.querySelector("#us_vtc_filter_op_1");
        document.us_vtc.filter_duration_elm_2 = document.querySelector("#us_vtc_filter_op_2");
        document.us_vtc.filter_duration_elm_3 = document.querySelector("#us_vtc_filter_op_3");
        document.us_vtc.filter_duration_elm_4 = document.querySelector("#us_vtc_filter_op_4");

        document.us_vtc.filter_watched_elm = document.querySelector("#us_vtc_filter_op_5");
    },
    saveFilter: () => {
        let data = {
            "filter_duration_elm_0": document.us_vtc.filter_duration_elm_0.checked,
            "filter_duration_elm_1": document.us_vtc.filter_duration_elm_1.checked,
            "filter_duration_elm_2": document.us_vtc.filter_duration_elm_2.checked,
            "filter_duration_elm_3": document.us_vtc.filter_duration_elm_3.checked,
            "filter_duration_elm_4": document.us_vtc.filter_duration_elm_4.checked,
            "filter_watched_elm": document.us_vtc.filter_watched_elm.checked,
        }

        GM_setValue('us_xht', JSON.stringify(data));

        ////debugLog("saveFilter:", data);
        document.us_vtc.is_change_filter = true;
    },
    loadFilter: () => {

        let value = GM_getValue('us_xht', null);
        if (value === null) {
            value = {
                "filter_duration_elm_0": true,
                "filter_duration_elm_1": true,
                "filter_duration_elm_2": true,
                "filter_duration_elm_3": true,
                "filter_duration_elm_4": true,
                "filter_watched_elm": true,
            };
        }
        try {
            value = JSON.parse(value);
            ////debugLog("loadFilter:", value);

            document.us_vtc.filter_duration_elm_0.checked = value.filter_duration_elm_0;
            document.us_vtc.filter_duration_elm_1.checked = value.filter_duration_elm_1;
            document.us_vtc.filter_duration_elm_2.checked = value.filter_duration_elm_2;
            document.us_vtc.filter_duration_elm_3.checked = value.filter_duration_elm_3;
            document.us_vtc.filter_duration_elm_4.checked = value.filter_duration_elm_4;
            document.us_vtc.filter_watched_elm.checked = value.filter_watched_elm;
        } catch (error) {

        }


    },
    applyFilter: () => {

        //debug("applyFilter is_change_filter:", document.us_vtc.is_change_filter);

        if (!document.us_vtc.is_change_filter) return;
        document.us_vtc.is_change_filter = false;

        document.us_vtc.on_apply_filter = true;
        document.us_vtc.filter_duration_elm_0.dispatchEvent(new Event('click'));
        document.us_vtc.filter_duration_elm_1.dispatchEvent(new Event('click'));
        document.us_vtc.filter_duration_elm_2.dispatchEvent(new Event('click'));
        document.us_vtc.filter_duration_elm_3.dispatchEvent(new Event('click'));
        document.us_vtc.filter_duration_elm_4.dispatchEvent(new Event('click'));
        document.us_vtc.filter_watched_elm.dispatchEvent(new Event('click'));
        document.us_vtc.on_apply_filter = false;

        //debugLog("applyFilter executed:");
    },
    filter: (evt) => {
        let elm = evt.target;
        let value = elm.value;
        let checked = elm.checked;
        //debug("FILTER", value, checked);

        switch (value) {
            case "10":
                document.us_vtc.viewWatchedVideos(checked);
                break;
            case "11":
                document.us_vtc.searchTitle();
                break;
            case "12":
                document.us_vtc.searchSimilar();
                break;
            case "13":
                document.us_vtc.searchTags();
                break;
            case "14":
                document.us_vtc.hideNoise();
                break;
            case "15":
                document.us_vtc.fnColorizeTime();
                break;
            case "16":
                let elm = document.querySelector("#us_vtc_filter");
                elm.remove();
                break;
            default:
                document.us_vtc.viewVideosDuration(value, checked);
        }

        if (!document.us_vtc.on_apply_filter) document.us_vtc.saveFilter();
    },
    searchTags: () => {
        let search = [];
        let tags = document.querySelectorAll("#video-tags-list-container > div > div > div > a");
        for (let tag of tags) {
            let href = tag.href;
            let text = tag.innerText;
            if (!href.includes("/categories/")) continue;
            let a_href = href.split("/");
            text = a_href[a_href.length - 1];
            search.push(text);
        }
        if (search.length === 0) {
            alert("No Found Tags");
            return;
        }
        search = search.join("+");
        window.open("https://xhamster.com/search/" + search, "_blank");
        //window.location.href = "https://xhamster.com/search/" + search;
    },
    searchSimilar: () => {
        let meta
        try {
            meta = document.querySelector('meta[name="description"]').content;
            meta = meta.toLowerCase();
        } catch (e) {
            alert("No Found Meta Description");
            return;;
        }

        let idx = meta.indexOf("video on xhamster");
        if (idx === -1) {
            alert("No Found Video on xhamster in meta");
            return;
        }

        let description = meta.substring(0, idx);
        let search = [];
        let a_words = description.split(" ");
        for (let word of a_words) if (word.length > 2) search.push(word);
        search = search.join("+");

        window.open("https://xhamster.com/search/" + search, "_blank");
        //window.location.href = "https://xhamster.com/search/" + search;


    },
    showMoreButton: () => {
        let button = getElementByText("button", "Show more related videos");

        if (button === null) return;
        if (button.classList.contains("us-button")) return;

        button.classList.add("us-button");
        button.addEventListener('click', function () {
            setTimeout(function () {
                document.us_vtc.fnColorizeTime();
                document.us_vtc.removeBanner();
                /* document.us_vtc.is_change_filter = true;
                document.us_vtc.applyFilter(); */
            }, 2000);
        })
        //debug("US XHS", "INJ BUTTON SUCCESS")
    },
    viewWatchedVideos: (visible) => {
        //debugLog("viewWatchedVideos", visible);
        let collection = document.querySelectorAll(".us-watched");
        for (let i = 0; i < collection.length; i++) {
            if (collection[i].tagName === "BODY") continue;
            /* collection[i].style.display = (visible) ? "initial" : "none";*/
            let exist = collection[i].classList.contains("us_vtc_filter_hide");
            if (visible && exist) collection[i].classList.remove("us_vtc_filter_hide");
            if (!visible && !exist) collection[i].classList.add("us_vtc_filter_hide");
        }
    },
    viewVideosDuration: (idx, visible) => {
        debugLog("viewVideosDuration", idx, visible);
        if (parseInt(idx) > 5) return;

        let collection = document.querySelectorAll(".us-watched-min-" + idx);
        for (let i = 0; i < collection.length; i++) {
            if (collection[i].tagName === "BODY") continue;
            let exist = collection[i].classList.contains("us_vtc_filter_hide");
            if (visible && exist) collection[i].classList.remove("us_vtc_filter_hide");
            if (!visible && !exist) collection[i].classList.add("us_vtc_filter_hide");
        }

    },
    hideNoise: () => {
        for (let i = 1; i < 6; i++) {
            let id = "#us_vtc_filter_op_" + i.toString();
            let idx = (i - 1).toString();

            let checked = ((i === 2 || i === 3))
            document.querySelector(id).checked = checked;
            document.us_vtc.viewVideosDuration(idx, checked);
        }
    },
    searchTitle: () => {
        let me = document.us_vtc;
        let search = null;
        let title = "";

        if (me.is_xnxx) {
            search = document.querySelector(".video-title > strong")
            if (search === null) return;
            title = search.innerText
            title = title.trim().replace(" ", "+");
            window.location.href = "https://www.xnxx.com/search/" + title + "/";
            return;
        }

        if (me.is_eporner) {
            search = document.querySelector("#video-info > h1");
            if (search === null) return;
            title = search.innerHTML.split("<span")[0];
            title = title.trim().replace(" ", "-");
            window.location.href = "https://www.eporner.com/search/" + title + "/";
            return;
        }

        if (me.is_xhamster) {
            search = getElementByText("h1", "Porn Video");
            if (search === null) return;

            title = search.innerText.trim().split(" ");
            title.pop();
            title.pop();
            title = title.join("+");
            window.location.href = "https://xhamster.com/search/" + title;
            return;
        }


    },
    autoplay: () => {
        let me = document.us_vtc;
        //console.debug("AUTOPLAY", me.is_autoplay);

        if (me.is_autoplay) return;

        let video_click = false;
        let btn = null;
        let host = window.location.host;
        if (host === 'www.hentaiworld.me') {
            btn = "#player > div.cover";
            video_click = true;
        }
        //if (host === 'xhamster.com') btn = "#player-container > div.xplayer-start-button";
        if (host === 'www.xvideos.com') btn = "#anc-tst-play-btn";

        if (btn === null) return;
        try {
            document.querySelector(btn).click();
            if (video_click) {
                setTimeout(() => {
                    console.debug(IERROR + "VIDEO PLAY")
                    try {
                        document.querySelector("video").play();
                    } catch (error) {
                        console.debug(IERROR + "ERRORE", error)
                    }

                }, 5000);
            }
        } catch (e) {
            //console.debug(e.message, e);
        }


        me.is_autoplay = true;

    },
    removeBanner: () => {
        let banner;

        //debugLog("removeBanner");

        if (document.us_vtc.is_xnxx) {
            banner = document.querySelector(".premium-results-line")
            if (banner !== null) banner.remove();
            return;
        }

        if (!document.us_vtc.is_xhamster) return;

        try {
            $('div[class*=overlay]').remove();
        } catch (e) {
        }


        banner = getElementByText("div", "download full length");
        if (banner !== null) banner.parentNode.parentNode.parentNode.remove();

        banner = getElementByText("span", 'Turn off ad blocker for better user experience');
        if (banner !== null) banner.parentNode.parentNode.parentNode.parentNode.parentNode.remove();

        banner = document.querySelectorAll('[ class*="rectangle--video" ]');
        if (banner.length > 0) banner[0].remove();

        let collection = document.querySelector(".thumb-list--sidebar");
        if (collection === null) return;
        for (let i = 0; i < collection.childElementCount; i++) {
            let item = collection.children[i];
            let is_thumb = item.classList.contains("thumb-list__item");
            if (!is_thumb) item.remove();
        }

    },
    sortVideos: () => {
        let element_video = [];
        const collection = document.getElementsByClassName("thumb-image-container__duration");

        for (let i = 0; i < collection.length; i++) {
            let elm = null;

            if (collection[i].childElementCount < 2) {
                elm = collection[i].children[0];
            } else {
                elm = collection[i].children[1];
            }
            let time = collection[i].innerText;

            if (time.indexOf(":") == -1) continue;

            let time_seconds = timeToSeconds(time);


            let record = {
                "element": elm.parentNode.parentNode.parentNode.parentNode,
                "seconds": time_seconds,
                "time": time,
            }
            element_video.push(record);
        }


        //debug(element_video);
        let sort_element = element_video.sort((a, b) => b.seconds - a.seconds);
        //debug(sort_element);

        for (let i = 0; i < sort_element.length; i++) {
            let sheet = sort_element[i].element;
            let parent = sheet.parentNode;
            parent.appendChild(sheet);
        }
    },
    enlargeContains: () => {
        let player_container = document.querySelector("#player-container");
        if (player_container === null) return;

        try {
            document.querySelector("body > div.main-wrap").style.maxWidth = "1600px";
            document.querySelector("body > div.main-wrap > main > div.width-wrap.with-player-container").style.maxWidth = "1600px";
            player_container.style.height = "800px";
            player_container.style.width = "1530px";
            player_container.parentElement.style.width = "1530px";
            document.querySelector("body > div.main-wrap > header").style.minHeight = "0";
        } catch (error) {

        }

    },
    enlargeVideoPlayer: () => {


        if (document.us_vtc.is_xnxx) {
            document.querySelector("#hlsplayer > div.buttons-bar.right.noselect > img:nth-child(3)").click();
            return;
        }

        if (!document.us_vtc.is_xhamster) return;

        let in_video = (location.href.indexOf("/movies/") > -1 || location.href.indexOf("/videos/") > -1);
        if (!in_video) return;


        //setTimeout(function () {

        let video_player = document.querySelector("#xplayer__video")
        let w = video_player.clientWidth;

        if (w < 1200) {
            let button = document.querySelector(".large-mode")
            button.click();
            $("#player-container").css("height", "780px");
        }

        let element = document.getElementsByTagName("main");
        if (element.length > 0) element[0].scrollIntoView();


        //}, 2000)

    },
    setZoom: (zoom, el) => {

        transformOrigin = [0, 0];
        el = el || instance.getContainer();
        var p = ["webkit", "moz", "ms", "o"],
            s = "scale(" + zoom + ")",
            oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";

        for (var i = 0; i < p.length; i++) {
            el.style[p[i] + "Transform"] = s;
            el.style[p[i] + "TransformOrigin"] = oString;
        }

        el.style["transform"] = s;
        el.style["transformOrigin"] = oString;

    },
    pictureInPicture: () => {
        if (!document.pictureInPictureElement) {
            if (gv.player) {
                if (gv.player.nodeName == "IFRAME") {
                    gv.player.contentWindow.postMessage("iframePicInPic", "*")
                } else {
                    gv.player.parentNode.querySelector("video").requestPictureInPicture()
                }
            } else {
                document.querySelector("video").requestPictureInPicture()
            }
        } else {
            document.exitPictureInPicture()
        }
    },
}


const us_highlight = {
    is_groups_fuq: groups_fuq.includes(c_host),
    highlight: (word, selector, bg_color = 'yellow', text_color = 'black') => {

        if (!word || !selector) return;

        const prefix_word = 'h-' + word.toLowerCase().replace(" ", "-").trim();
        console.debug("🔷 highlight", word, selector, bg_color, text_color, prefix_word);

        // Funzione per evidenziare testo
        const evidenziaTesto = (nodo) => {
            if (nodo.nodeType === 3) { // Nodo di testo
                if (!nodo.nodeValue.includes(prefix_word)) {
                    const regex = new RegExp(`(${word})`, 'gi');
                    const htmlEvidenziato = nodo.nodeValue.replace(regex, `<span data-id='${prefix_word}' style="background-color: ${bg_color}; color: ${text_color}">$1</span>`);
                    const wrapper = document.createElement('span');
                    wrapper.innerHTML = htmlEvidenziato;
                    nodo.replaceWith(wrapper);
                }
            } else if (nodo.nodeType === 1 && nodo.tagName !== 'SCRIPT' && nodo.tagName !== 'STYLE') {
                nodo.childNodes.forEach(evidenziaTesto);
            }
        };

        // Cerca tutti gli elementi con la classe specificata
        const elementi = document.querySelectorAll(`${selector}`);
        elementi.forEach((elemento) => elemento.childNodes.forEach(evidenziaTesto));
    },
    remove_highlight: (word, selector, bg_color = 'yellow', text_color = 'black') => {

    },
    execute: () => {
        const words = ['ass', 'anal', 'creampie'];

        if (c_host == 'xhamster.com') {
            words.forEach((value) => us_highlight.highlight(value, '.video-thumb-info__name', '#fff100', '#0d0e12'));
            return;
        }
        if (us_highlight.is_groups_fuq) {
            words.forEach((value) => us_highlight.highlight(value, '.item-title', '#fff100', '#0d0e12'));
            return;
        }
        if (c_host == 'www.analgalore.com') {
            words.forEach((value) => us_highlight.highlight(value, '.item-title', '#fff100', '#0d0e12'));
            return;
        }
    }
}
document.us_highlight = us_highlight;


const menu_command_id_2 = GM_registerMenuCommand("Initialize", function (event) {
    element_video = [];
    document.us_vtc.is_init = false;
    document.us_vtc.init();
}, "q");

const menu_highlight = GM_registerMenuCommand("Highlight", function (event) {
    us_highlight.execute();
}, "w");

(async function () {


    window.addEventListener('load', async function () {


        document.us_vtc.init();

        $(window).on('popstate', function () {
            //debugLog("VideoTimeControl", "popstate");
        });

        window.addEventListener("pageshow", function (event) {
            let historyTraversal = event.persisted || (typeof window.performance != "undefined" && window.performance.navigation.type === 2);
            if (historyTraversal) {

                document.us_vtc.init();
            }
        });

        document.onvisibilitychange = function () {
            if (!document.hidden) {
                document.us_vtc.autoplay();
            }
            document.us_vtc.init();
        };

    }, false);

})();
//https://www.analgalore.com/out/?l=
//https://www.analgalore.com/out/?l=3AARbc4Wvzaoq2o5ZTZ6QmczdzJlAtlOaHR0cHM6Ly9zZXhwZXN0ZXIuY29tL3ZpZGVvLzQ2NjkyL2Vub3VnaC1pcy1hbHdheXMtYS1iaXQtbW9yZS8/dXRtX2NhbXBhaWduPXRmzQUDonRjAc0Jh6dwb3B1bGFyBdk0eyJhbGwiOiIiLCJvcmllbnRhdGlvbiI6InN0cmFpZ2h0IiwicHJpY2luZyI6ImZyZWUifc0H5M5nAbmtqGNhdGVnb3J5zRBgwA%3D%3D&c=20566c94&v=3&

function isset(variable) {
    return !(variable === undefined || variable === null)
}

function handleClick(event) {


    console.log(event.target);
    let elm = event.target;
    let href = elm.href;
    href = href.replace("https://www.analgalore.com/out/?l=", "");
    console.log("PREE", href);
    href = href.split("&")[0];
    console.log("PREE 2", href);
    href = atob(href);
    console.log("AFTER", href);
    event.preventDefault(); // Prevents the default action
}

function preventClickTagA() {
    let collection = document.querySelectorAll("a");
    for (let i = 0; i < collection.length; i++) {
        let elm = collection[i];

        let href = elm.href;
        if (!isset(href)) continue;
        if (href.indexOf("/out/") === -1) continue;
        elm.onclick = handleClick;
    }
}

