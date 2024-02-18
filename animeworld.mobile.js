// ==UserScript==
// @name         animeworld v0.2
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  animeworld v0.2
// @author       Fabio Lucci
// @match        http*://www.animeworld.so/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animeworld.so
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addElement
// @grant        GM_getValue
// ==/UserScript==

'use strict';

function aLog(text, error = true) {
    let tag = 'color: white; background: #367dc3 ; font-size: 14px; margin-right:5px; padding:4px';
    if (error) {
        console.log('%cAWL' + '%c' + text, tag, 'color: white; background: #721c24 ; font-size: 14px; padding:4px');
    } else {
        console.log('%cAWL' + '%c' + text, tag, 'color: black; background: #cfe3f7 ; font-size: 14px; padding:4px');
    }
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length - size);
}

jQuery.fn.notExist = function () {
    return (this.length === 0);
}

jQuery.fn.selectText = function () {
    this.find('input').each(function () {
        if ($(this).prev().length == 0 || !$(this).prev().hasClass('p_copy')) {
            $('<p class="p_copy" style="position: absolute; z-index: -1;"></p>').insertBefore($(this));
        }
        $(this).prev().html($(this).val());
    });
    var doc = document;
    var element = this[0];
    console.log(this, element);
    if (doc.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

document.progressDialog = {
    show: function () {

        if (document.querySelector("#pleaseWaitDialog") == null) {
            var modalLoading = '<div class="modal" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false" role="dialog">\
                <div class="modal-dialog">\
                    <div class="modal-content">\
                        <div class="modal-header">\
                            <h4 class="modal-title">Please wait...</h4>\
                        </div>\
                        <div class="modal-body">\
                            <div class="progress">\
                              <div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar"\
                              aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%; height: 40px">\
                              </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>';
            $(document.body).append(modalLoading);
        }

        $("#pleaseWaitDialog").modal("show");
    },
    hide: function () {
        $("#pleaseWaitDialog").modal("hide");
    }
}


var
    is_aw = window.location.href.indexOf("animeworld.so") > 0;

aLog("IS AW: " + is_aw.toString(), false);

document.selectAll = function (copy) {

    if (copy) {
        let links = document.querySelector("#epidodes_links").innerText;
        try {
            navigator.clipboard.writeText(links);
            alert("Links copied!");
        } catch (error) {
            alert("ERROR copy links!");
        }
    } else {
        $("#epidodes_links").selectText();
    }
}


document.userscript_aw = {
    status_text_2: ['', 'IN CORSO', 'COMPLETATI', 'IN PAUSA', 'DROPPATI', 'N/A', 'DA GUARDARE'],
    status_text: ['', 'Watching', 'Completed', 'On Hold', 'Dropped', 'N/A', 'Plan to Watch'],
    status_color: ['', '#4855db', '#47c951', '#3A6378', '#d45050', 'white', '#ddeb73'],
    anime_stored: [],
    storage: [],
    findMalID: function () {
        let a = $('a[href*="myanimelist"]');
        if (a.length === 0) return 0;
        let s_a = a[0].toString().split("/");
        a = s_a[s_a.length - 1];
        return parseInt(a);
    },
    coloreByStato: function (stato) {
        let colore;
        switch (stato) {
            case "IN CORSO":
                colore = "aquamarine";
                break;
            case "COMPLETATI":
                colore = "chartreuse";
                break;
            case "IN PAUSA":
                colore = "gold";
                break;
            case "DROPPATI":
                colore = "darkorange";
                break;
            case "DA GUARDARE":
                colore = "hotpink";
                break;
            default:
                colore = "white";
                break;
        }
        return colore
    },
    showLinksDownload: function () {
        let n_zero = 2;
        let episodi_ul = $("#animeId > div.widget-body > div.server.active > ul");
        if (episodi_ul.notExist()) return false;

        let episodi_count = episodi_ul[0].childElementCount;
        if (episodi_count === 0) return false;

        aLog("N. EPISODI: " + episodi_count.toString(), false);

        let pre = $("#epidodes_links");

        if (pre.notExist()) {
            let widget = `
        <div class="widget crop" id="animeWordLinks">
            <div class="widget-title">
                <span class="title">Link Episodi</span>
            </div>
            <div class="widget-body" style="padding-bottom: 0px;">
                <pre id="epidodes_links" style="background: transparent;max-height: 250px;text-align: left;"></pre>
            </div>
            <div class="widget-title" style="padding-bottom: 8px;">
                <a href="javascript:document.selectAll(false)" id="select_all" class="m-1 btn btn-sm btn-primary">
                    <i class="fas fa-list-radio"></i>&nbsp;&nbsp;Seleziona Links
                </a>
                <a href="javascript:document.selectAll(true)" id="copy_all" class="m-1 btn btn-sm btn-primary">
                    <i class="fas fa-v"></i>&nbsp;&nbsp;Copia Links
                </a>
            </div>
        </div>`;

            let div = $(".comment-resource-vessel");
            if (div.notExist()) {
                $("#main > div").append(widget);
            } else {
                div.before(widget);
            }

        }

        pre = $("#epidodes_links");
        pre.text("");

        if (episodi_count > 99) n_zero = 3;

        let link_a = $("#alternativeDownloadLink");
        if (link_a.notExist()) return false;
        link_a = link_a.attr("href").toString();

        if (/_Ep_(.*?)_/im.test(link_a)) {

            for (let i = 1; i <= episodi_count; i++) {
                let episodio = "_Ep_" + pad(i, n_zero) + "_";
                let link_new = link_a.replace(/_Ep_(.*?)_/img, episodio);
                pre.append(link_new + "\r\n");
            }
        } else {
            pre.append("⚠️ WARNING: NO EPISODES GENERATE\r\n" + link_a + "\r\n");
        }
    },
    currentStatusSetText: function (text, color) {
        let btn = document.querySelector("div.userbookmark");
        btn.querySelector("span").innerHTML = "Watchlist";
        btn.querySelector("span").innerHTML += ": <b style=\"background: " + color + ";padding: 3px;\">" + text + '</b>';
    },
    currentStatusClick: function () {
        let self = this;
        $('ul.bookmark').delegate('li', 'click', function () {
            let id = $(this).attr("data-value-alt");
            if (isNaN(id)) return;

            self.currentStatusSetText("ATTENDERE 4 SEC.", "gold");
            setTimeout(function () {
                self.currentStatus();
            }, 4000)

        });
    },
    currentStatusGetText: function () {
        let status = "NESSUNO";
        let bookmark = document.querySelector("ul.bookmark")
        if (bookmark == null) return "";
        let active = bookmark.querySelector(".active");
        if (active != null) status = active.innerText;
        return $.trim(status.toUpperCase());
    },
    currentStatus: function () {

        let color = "white";
        let status = this.currentStatusGetText();
        if (status === "") return;

        switch (status) {
            case "IN CORSO":
                color = "aquamarine";
                break;
            case "COMPLETATI":
                color = "chartreuse";
                break;
            case "IN PAUSA":
                color = "gold";
                break;
            case "DROPPATI":
                color = "darkorange";
                break;
            case "DA GUARDARE":
                color = "hotpink";
                break;
            default:
                color = "white";
                break;
        }

        this.currentStatusSetText(status, color);
        this.detailsAnime();
    },
    saveDetails(title, status) {
        let dbanimes = GM_getValue("dbanimes", "[]");
        dbanimes = JSON.parse(dbanimes);
        dbanimes.push({
            "title": title,
            "status": status,
        });

        document.userscript_aw.anime_stored = dbanimes;
        GM_setValue("dbanimes", JSON.stringify(dbanimes, null, 2));



    },
    detailsAnime: function () {

        let title = $("h2.title").text();
        let jtitle = $("h2.title").attr("data-jtitle");
        if (jtitle === undefined) jtitle = "";

        let status = this.currentStatusGetText();

        this.saveDetails(title, status);
        if (jtitle != "") this.saveDetails(jtitle, status);


    },
    animeSearch: function (title, dbanimes) {
        for (let i = 0; i < dbanimes.length; i++) {
            let anime = dbanimes[i];

            if (anime.title == title) return anime.status;
        }
        return "";
    },
    addAnimeStatus: function (data) {
        let self = this;

        $(".name").each(function (i) {
            let title = $(this).attr("data-jtitle");
            if (title === undefined) return;

            title = title.toLowerCase();
            let status = data[title];

            if (status === "NESSUNO" || status === "" || status === undefined) return;

            let idx = document.userscript_aw.status_text_2.indexOf(status);

            let bg_color = document.userscript_aw.status_color[idx];

            if (bg_color !== "white") {
                var div = `<div class="anime-tag" style="position: absolute;top: 0px;color: white;background:${bg_color};padding: 8px;">${status}</div>`;
                $(this).parent().find(".poster").append(div);
            }

        });


    },
    revertData: function (data) {
        let reverse_data = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].title == null) continue;
            let key = data[i].title.toLowerCase();
            let value = data[i].status;
            reverse_data[key] = value;
        }
        return reverse_data;
    },
    getAnimeNames: function () {
        let self = this;
        let anime_titles = [];
        let sheets = document.querySelectorAll("div.item");

        let current_storage = GM_getValue("dbanimes", "[]");
        current_storage = JSON.parse(current_storage);
        current_storage = self.revertData(current_storage);
        this.storage = current_storage;

        self.addAnimeStatus(current_storage);

    },

    removeAD: function () {
        setTimeout(function () {
            $("[class*=dont-remove]").remove();
        }, 7000);
    },
    getStatusFromId: function (id) {
        let status = "NESSUNO";
        switch (id) {
            case "1":
                status = "IN CORSO";
                break;
            case "2":
                status = "COMPLETATI";
                break;
            case "3":
                status = "IN PAUSA";
                break;
            case "4":
                status = "DROPPATI";
                break;
            case "5":
                status = "DA GUARDARE";
                break;
            default:
                status = "NESSUNO";
                break;
        }
        return status;
    },
    addButton: function () {
        let me = this;


        let current_storage = GM_getValue("dbanimes", "[]");
        current_storage = JSON.parse(current_storage);


        let btn_parse = `
            <div class="watchlist-control-extra d-flex" style="margin-top: 8px">    
                <button id="parse_list_anime"
                    class="watchlist-reset-button2 btn-succes mt-2 p-2 border-0 d-flex justify-content-center align-items-center"
                    style="margin-left: 3px" data-tippy-content="Parse list">
                    <i class="fas fa-comments"></i>&nbsp;Parse

                </button><button id="get_database"
                    class="watchlist-reset-button2 btn-danger mt-2 p-2 border-0 d-flex justify-content-center align-items-center"
                    style="margin-left: 3px" data-tippy-content="Database">
                    <i class="fas fa-database"></i>&nbsp;Database
                </button>
            </div>
        `;


        $(".watchlist-expanded-control").append(btn_parse);


        $("#get_database").on("click", function () {
            let dbanimes = [];

            $(".title > .link > a").each(function (i) {

                let title = $(this).text();
                let jtitle = $(this).attr("data-jtitle");
                let folder = $(this).parent().parent().parent().parent().parent().parent().attr("data-folder");
                if (jtitle === undefined) jtitle = '';

                let status = me.getStatusFromId(folder);
                console.log(status, title, jtitle);


                dbanimes.push({
                    "title": jtitle,
                    "status": status,
                });
                GM_setValue("dbanimes", JSON.stringify(dbanimes, null, 2));


                if (jtitle != "") {
                    dbanimes.push({
                        "title": jtitle,
                        "status": status,
                    });
                    GM_setValue("dbanimes", JSON.stringify(dbanimes, null, 2));
                }

            });

            //console.log(dbanimes);
        });

        $("#parse_list_anime").on("click", function () {
            document.progressDialog.show();
            $(".title > .link > a").each(function (i) {
                let title = $(this).text();
                let jtitle = $(this).attr("data-jtitle");
                let folder = $(this).parent().parent().parent().parent().parent().parent().attr("data-folder");
                if (jtitle === undefined) jtitle = '';

                let status = me.getStatusFromId(folder);
                console.log(status, title, jtitle);

                me.saveDetails(title, status);
                if (jtitle != "") me.saveDetails(jtitle, status);

            });
            let n_anime = document.userscript_aw.anime_stored.length;
            
            document.progressDialog.hide();
            alert("N. Animes: " + n_anime)
        });
    },
    calendiario: function () {
        let me = this;
        if (location.href !== 'https://www.animeworld.so/') return;

        $("body").append(`
        <style>
            .anime-status{
                font-size: 8px;
                padding: 2px;
            }
        </style>
        `);

        $(".info > .name").each(function (i) {
            let title = $(this).text();
            let jtitle = $(this).attr("data-jtitle");
            if (jtitle === undefined) jtitle = title;

            jtitle = jtitle.toLowerCase();
            let status = me.storage[jtitle];

            if (status !== undefined) {
                let colore = me.coloreByStato(status);
                $(this).css("font-weight", "bold");
                $(this).append(`<br><span class="anime-status" style='background: ${colore}'>${status}</span>`);
            }


        })
    },
    execute: function () {
        let href = window.location.href;
        let is_play = (href.indexOf("/play/") > 0);
        let is_upcoming = (href.indexOf("/upcoming/") > 0);
        let is_watchlist = (href.indexOf("/watchlist/") > 0);
        let is_mobile = navigator.userAgentData.mobile;
        try {

            if (is_play) {
                $("#tags").remove();
                this.currentStatusClick();
                this.currentStatus();
                if (!is_mobile) this.showLinksDownload();
            }

            this.getAnimeNames();
            this.removeAD();

            if (is_watchlist) {
                this.addButton();
            }
            this.calendiario();

        } catch (error) {
            aLog('ERROR ');
            console.error(error);
        }

    }
}


$(document).ready(function () {
    if (!is_aw) return;
    document.userscript_aw.execute();
    return;
});
