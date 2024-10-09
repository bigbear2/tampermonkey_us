// ==UserScript==
// @name         PageVisited
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  PageVisited
// @author       bigbear2sfc
// @match        http://*
// @match        https://*
// @include      http://*
// @include      https://*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lovenselife.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==


const IOK = '📗';
const IERROR = '📕';
const IWARNING = '📙';

document.onClickLinkPageVisited = () => {
    ////console.debug("BOOOOOOOOOOOOO", this);
}

document.onClickPageVisited = () => {
    return;
    let count = 0;

    const collection = document.querySelectorAll("a");
    for (let i = 0; i < collection.length; i++) {

        let elm = collection[i];
        if (elm == undefined || elm == null) continue;


        let href = elm.href;
        let title = elm.innerText.toString();

        if (href == "#" || href == "#PV") continue;
        elm.setAttribute("furl", href);
        elm.href = "javascript:document.onClickLinkPageVisited();";
        elm.addEventListener("click", (ref) => {
            debugLog(IOK + "CLIKKKKK", ref.target);
            removeEventListener(elm, "click");

            href = elm.href;
            title = elm.innerText.toString();
            document.pagevisited.execute(title, href);


            let me = ref.target;
            me.href = me.getAttribute("furl");
            setTimeout(() => me.click(), 1500);
        });
        count++;
    }

    debugLog(IWARNING + "onClickPageVisited", count);
}

document.pagevisited = {
    update: false,
    added_href: false,
    pages: [],
    is_init: false,
    bookmarks: [],
    bookmarks_remote: [],
    remote_js: "",
    remote_css: "",
    notify_ready: false,
    last_record: null,
    init: function () {
        let me = document.pagevisited;
        if (document.pagevisited.is_init) return;
        document.pagevisited.is_init = true


        let css = `
            .toast-error{
                color: white;
                text-shadow: 4px 3px 0 #7A7A7A;
                background: linear-gradient(to bottom,  #ff3019 0%,#cf0404 100%);
            }
            .toast-info{
                color: white;
                text-shadow: 4px 3px 0 #7A7A7A;
                /*background: linear-gradient(to bottom,  #87e0fd 0%,#53cbf1 40%,#05abe0 100%);*/
                background: linear-gradient(90deg, #1f005c, #260d71, #2c1b87, #30299d, #3136b5, #3045cd, #2a53e6, #1962ff);
            }
            .visited-link{
                border: 20px solid #d250ff! important;
                background: #454545! important;
                color: white! important;
            }

            .pv-info-hide{
                display:none;
            }
            #pv-info {
                position: fixed;
                bottom: 4px;
                background: crimson;
                line-height: 2;
                text-align: center;
                color: white;
                font-size: 13px;
                font-family: sans-serif;
                font-weight: bold;
                z-index: 99999;
                left: -90px;
                padding: 6px;
                opacity: 0.5;
                filter: alpha(opacity=50);
                transition: 0.3s;
            }

            #pv-info:hover{
                opacity: 1;
                filter: alpha(opacity=100);
                transition: 0.3s;
                left: 4px;
            }

            tooltip {
                position: fixed;
                background: #fff;
                color: #333;
                border: 2px solid #333;
                font-size: 15px;
            }
        `;

        GM_addStyle(css);


        let obj_css = `<div id="pv-info" class="pv-info-hide" onclick="document.querySelector('#pv-info').remove();" style='cursor: pointer;'>VISITED</div>`;
        document.body.insertAdjacentHTML("beforeend", obj_css);

        me.startProcess();


        //infoLog(document.pagevisited.bookmarks);
        return;

        try {

            let collection = document.querySelectorAll("a");
            for (let i = 0; i < collection.length; i++) {
                let object = collection[i];
                object.addEventListener("click", (ref) => {
                    //debugLog("CLIKKKKK", ref);
                });
            }
            ;


        } catch (error) {
            errorLog('pageVisited', 'ERRORE', error.message);
        }
    },
    notify: function (message, _duration = 10000, error = true) {
        document.toast.notify(message, _duration, (error) ? document.toast.T_ERROR : document.toast.T_NORMAL);

    },
    exist: function (href) {
        for (let i = 0; i < document.pagevisited.bookmarks.length; i++) {
            let elm = document.pagevisited.bookmarks[i];
            if (href === elm.href) {
                return elm.last_view;
            }
        }
        ;
        return "";
    },
    remoteExist: function (href) {
        let me = document.pagevisited;
        for (let i = 0; i < me.bookmarks_remote.length; i++) {
            if (href === me.bookmarks_remote[i].href) return item;
        }
        return null;
    },
    execute: function (title, href) {
        let me = document.pagevisited;
        document.pagevisited.init();

        let added = false;
        let last_view = null;
        let index = -1;
        let adesso = Date.now();
        adesso = document.userscript_global.italianTimeFormat(adesso);


        let min = 10 * 60000;
        setTimeout(function () {
            document.pagevisited.update = false;
        }, min);

        if (document.pagevisited.added_href) return;
        if (document.pagevisited.update) return;
        document.pagevisited.update = true;

        document.pagevisited.bookmarks.forEach((element, idx) => {
            //debug(element);
            if (href === element.href) {
                added = true;
                last_view = element.last_view;
                index = idx;
                return;
            }
        });

        if (added) {
            try {
                document.pagevisited.notify('VISITATO: ' + last_view);
                let element = document.querySelector("#pv-info");
                element.innerHTML = "&#10006; VISITATO:<br>" + last_view;
                element.classList.remove("pv-info-hide");


            } catch (error) {
                errorLog('pageVisited', 'ERRORE', error.message);
            }
            debugLog('pageVisited', 'VISITATO', last_view);
            document.pagevisited.bookmarks[index].last_view = adesso;
        } else {
            let elm = {
                "title": title,
                "href": href,
                "last_view": adesso,
            }
            document.pagevisited.bookmarks.push(elm);
            //if (me.bookmarks_remote !== null) me.bookmarks_remote.push(elm);


            debugLog('pageVisited', 'AGGIUNTO');
            document.pagevisited.added_href = true;
            document.pagevisited.notify('AGGIUNTO', 5000, false);
        }

        me.endProcess();
        return;

        setTimeout(() => {
            let collection = document.querySelectorAll("a");
            collection.forEach((element) => {
                if (element.classList.contains("pv-visited")) return;

                let hint = element.getAttribute("title");
                let view = document.pagevisited.exist(element.href);

                if (hint === null) {
                    hint = "📒 " + element.href;
                    element.setAttribute("title", hint);
                }

                if (hint.indexOf("VISITATO") === -1) {

                    if (view !== "") {

                        hint = "📘 VISITATO: " + view + " - " + hint;
                        element.setAttribute("title", hint);
                        element.setAttribute("tooltip", hint);
                        element.classList.add("pv-visited");
                    }
                }
                //debug("ELEMENT VISITED", element.href, view);

            })


            try {
                document.pagevisited.tooltips();
            } catch (error) {
                errorLog('pageVisited', 'tooltips', error.message);
            }


        }, 1000);
    },
    startProcess: () => {
        let me = document.pagevisited;
        let title = document.title;
        let href = window.location.href;


        document.pagevisited.bookmarks = GM_getValue("pageVisited", "[]");
        document.pagevisited.bookmarks = JSON.parse(document.pagevisited.bookmarks);

        try {
            document.userscript_global.getValue("pageVisited", "[]", (json) => {
                json = JSON.parse(json);
                me.bookmarks_remote = json.data;
                if (typeof me.bookmarks_remote === 'object' && !Array.isArray(me.bookmarks_remote) && me.bookmarks_remote !== null)
                    me.bookmarks_remote = Object.values(me.bookmarks_remote);
                //console.debug(IOK + 'PAVEVISITED', "GET VALUE", json, me.bookmarks_remote)
                me.execute(title, href);
            });
        } catch (e) {
            console.debug(IERROR + "PAVEVISITED", 'GET VALUE', e)
            me.bookmarks_remote = null;
            me.execute(title, href);
        }
    },
    endProcess: () => {
        let me = document.pagevisited;

        setTimeout(() => {
            let json = JSON.stringify(document.pagevisited.bookmarks);
            GM_setValue("pageVisited", json)

            try {
                if (me.bookmarks_remote === null) return;
                document.userscript_global.setValue("pageVisited", me.bookmarks_remote, (json) => {
                    json = JSON.parse(json);
                    me.bookmarks_remote = json.data;
                    //console.debug(IOK + 'PAVEVISITED', "SET VALUE", json, me.bookmarks_remote)
                });
            } catch (e) {
                console.debug(IERROR + "PAVEVISITED", 'SET VALUE', e)
            }


        }, 1000)
    },
    cloneProcess: () => {
        let me = document.pagevisited;
        me.bookmarks_remote = {...me.bookmarks};
        me.endProcess();
    },
    tooltips: function () {


        var a = document.getElementsByTagName('*'),
            tip, text,
            base = document.createElement('tooltip'); //Defining all objects

        for (var x = 0; x < a.length; x++) { //I'm using "for" loop to get all "a" elements with attribute "tooltip".
            a[x].onmouseover = function () {
                text = this.getAttribute('tooltip');
                tip = document.createTextNode(text);
                if (text != null) {// Checking if tooltip is empty or not.
                    base.innerHTML = '';
                    base.appendChild(tip);
                    if (document.getElementsByTagName('tooltip')[0]) {// Checking for any "tooltip" element
                        document.getElementsByTagName('tooltip')[0].remove();// Removing old tooltip
                    }
                    base.style.top = (event.pageY + 20) + 'px';
                    base.style.left = (event.pageX + 20) + 'px';
                    document.body.appendChild(base);
                }

            };
            a[x].onmouseout = function () {
                try {
                    document.getElementsByTagName('tooltip')[0].remove();// Remove last tooltip
                } catch (error) {

                }

            };
        }
    },
    tooltipsElement: function (elm, text) {
        var a = tip,
            base = document.createElement('tooltip'); //Defining all objects


        elm.onmouseover = function () {

            tip = document.createTextNode(text);
            if (text != null) {// Checking if tooltip is empty or not.
                base.innerHTML = '';
                base.appendChild(tip);
                if (document.getElementsByTagName('tooltip')[0]) {// Checking for any "tooltip" element
                    document.getElementsByTagName('tooltip')[0].remove();// Removing old tooltip
                }
                base.style.top = (event.pageY + 20) + 'px';
                base.style.left = (event.pageX + 20) + 'px';
                document.body.appendChild(base);
            }

        };
        elm.onmouseout = function () {
            try {
                document.getElementsByTagName('tooltip')[0].remove();// Remove last tooltip
            } catch (error) {

            }
        };

    }

};

(async function () {


    window.addEventListener('load', async function () {

        document.pagevisited.startProcess();
        $(window).on('popstate', function () {
        
        });

        window.addEventListener("pageshow", function (event) {
            let historyTraversal = event.persisted || (typeof window.performance != "undefined" && window.performance.navigation.type === 2);
            if (historyTraversal) {
                document.pagevisited.startProcess();
           
            }
        });

        document.onvisibilitychange = function () {
            //debugLog("PAGEVISITED", "onvisibilitychange", document.hidden);
            if (!document.hidden) {
                document.pagevisited.startProcess();
            }
       
        };

    }, false);

})();