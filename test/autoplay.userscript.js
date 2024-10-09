// ==UserScript==
// @name         xEngine Autoplay
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  xEngine Autoplay
// @author       bigbear2sfc
// @match        https://www.hentaiworld.me/*
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
// @grant        none
// ==/UserScript==

'use strict';

const XHAMSTER_PLAY_PATH = "#player > div.xplayer-start-button";

const us_autoplay = {
    is_init: false,
    embed: false,
    embed_words: ["/embed/", "/embedframe/"],
    timer: null,
    init: () => {
        let me = us_autoplay;

        //let embed_1 = document.location.href.indexOf("/embed/") > -1;
        //let embed_2 = document.location.href.indexOf("/embedframe/") > -1;
        //me.embed = (embed_1 || embed_2);
        me.embed = me.arrayIndexOf(me.embed_words, document.location.href);

        console.debug("US-AUTOPLAY", "init:", me.is_init, "embed:", me.embed);

        if (me.is_init) return;
        me.is_init = true;

        let host = window.location.host;
        if (host === 'xhamster.com') me.xhamster();
        if (host === 'www.hentaiworld.me') me.click("#player > div.cover", true);
        if (host === 'www.xvideos.com') me.click("#anc-tst-play-btn");

    },
    arrayIndexOf: (a_search, text) => {
        for (let i = 0; i < a_search.length; i++) {
            if (text.indexOf(a_search[i]) > -1) return true;
        }
        return false;
    },
    hentaiworld: () => {

    },
    xhamster: () => {
        let me = us_autoplay;


        console.debug("US-AUTOPLAY", "xhamster", me.embed, document.location.href);
        if (!me.embed) return;

        let result = us_autoplay.clickBySelector(XHAMSTER_PLAY_PATH);
        if (result) return;

        me.timer = setInterval(() => {
            console.debug("US-AUTOPLAY", "xhamster", "interval");
            let result = us_autoplay.clickBySelector(XHAMSTER_PLAY_PATH);
            if (result) clearInterval(us_autoplay.timer);

        }, 500);


    },
    xvideos: () => {

    },
    clickBySelector: (selector) => {
        let element = document.querySelector(selector);
        if (element === null) return false;
        element.click();
        return true;
    },
    click: (selector, video_click = false) => {
        let me = us_autoplay;
        console.debug("US-AUTOPLAY", "click", me.embed, selector, video_click, document.location.href);

        let element = document.querySelector(selector);
        if (element === null) {
            return;
        }
        try {
            document.querySelector(selector).click();
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
    }


}


document.addEventListener('load', function () {
    us_autoplay.init();

    document.addEventListener("pageshow", function (event) {
        let historyTraversal = event.persisted || (typeof window.performance != "undefined" && window.performance.navigation.type === 2);
        if (historyTraversal) {
            us_autoplay.init();
        }
    });

    document.onvisibilitychange = function () {
        if (!document.hidden) {
            us_autoplay.init();
        }
        us_autoplay.init();
    };

}, false);

$(document).ready(() => us_autoplay.init());