// ==UserScript==
// @name         WA-JS Core
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  WA-JS Core
// @author       Fabio L. 2024
// @match        https://web.whatsapp.com/*
// @icon         https://www.google.com/s2/favicons?domain=whatsapp.com
// @require      https://github.com/wppconnect-team/wa-js/releases/download/nightly/wppconnect-wa.js
// @grant        none
// ==/UserScript==

/* globals WPP */

window.WPUtils = {
    init: () => {
        let html = `<style>
        #snackbar {
          visibility: hidden;
          min-width: 250px;
          margin-left: -125px;
          background-color: #333;
          color: #fff;
          text-align: center;
          border-radius: 2px;
          padding: 16px;
          position: fixed;
          z-index: 9999999;
          left: 50%;
          bottom: 30px;
          font-size: 17px;
        }
        
        #snackbar.show {
          visibility: visible;
          -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
          animation: fadein 0.5s, fadeout 0.5s 2.5s;
        }
        
        @-webkit-keyframes fadein {
          from {bottom: 0; opacity: 0;} 
          to {bottom: 30px; opacity: 1;}
        }
        
        @keyframes fadein {
          from {bottom: 0; opacity: 0;}
          to {bottom: 30px; opacity: 1;}
        }
        
        @-webkit-keyframes fadeout {
          from {bottom: 30px; opacity: 1;} 
          to {bottom: 0; opacity: 0;}
        }
        
        @keyframes fadeout {
          from {bottom: 30px; opacity: 1;}
          to {bottom: 0; opacity: 0;}
        }
        </style>
        <div id="snackbar">Some text some message..</div>`;

        window.document.body.insertAdjacentHTML('afterbegin', html);
    },
    toast: (message, timeout = 3000) => {
        var x = document.getElementById("snackbar");
        x.innerHTML = message;
        x.className = "show";
        setTimeout(function () { x.className = x.className.replace("show", ""); }, timeout);
    }
};



(function () {
    'use strict';

    window.WPUtils.init();

    WPP.webpack.onReady(function () {
        window.WPUtils.toast('Ready to use WPPConnect WA-JS', 6000);
    });


})();