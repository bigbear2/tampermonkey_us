// ==UserScript==
// @name         Global Functions
// @namespace    io.bigbear2.global
// @version      0.4
// @description  Global Functions
// @author       You
// @match        http*://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource CONSOLE_LOG_JS     https://patik.github.io/console.log-wrapper/consolelog.js
// @resource CONSOLE_LOG_DETAILS_JS     https://patik.github.io/console.log-wrapper/consolelog.detailprint.js
// ==/UserScript==

document.userscript_global = {
    bootstrap_version: null,
    video: null,
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
        document.userscript_global.console();

    },
    log: (module = 'GLOBAL FUNCTION', ...valuesArguments) => {
        module = 'MODULE: ' + module.toUpperCase();
        try {
            log.settings({lineNumber: true, group: {label: module, collapsed: false}});
            log(valuesArguments);
        } catch (e) {
            console.log(module, valuesArguments)
        }
    },
    isMobile: () => {
        let result = false;
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            result = true;
        }
        return result;
    },
    console: () => {
        try {
            console._commandLineAPI = undefined;
        } catch (error) {
        }
        try {
            console._inspectorCommandLineAPI = undefined;
        } catch (error) {
        }
        try {
            console.clear = undefined;
        } catch (error) {
        }

        let elm = document.createElement("script");
        elm.innerHTML = "console.clear=()=>{}";
        elm = document.documentElement.appendChild(elm);
        window.setTimeout(() => {
            document.documentElement.removeChild(elm);
            document.userscript_global.setResource("CONSOLE_LOG_JS");
            document.userscript_global.setResource("CONSOLE_LOG_DETAILS_JS");
            document.userscript_global.log("INIT");
        }, 10)
    },
    getXPathElement: (element) => {
        if (element.id !== '')
            return '//*[@id="' + element.id + '"]';
        if (element === document.body)
            return element.tagName;
        let ix = 0;
        let siblings = element.parentNode.childNodes;
        for (let i = 0; i < siblings.length; i++) {
            let sibling = siblings[i];
            if (sibling === element)
                return document.userscript_global.getXPathElement(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
                ix++;
        }
    },
    secondsToHms: (d) => {
        d = Number(d);
        let h = Math.floor(d / 3600);
        let m = Math.floor((d % 3600) / 60);
        let s = Math.floor((d % 3600) % 60);

        let hDisplay = document.userscript_global.padDigits(h, 2) + ":";
        if (hDisplay === "00:") hDisplay = "";

        return hDisplay + document.userscript_global.padDigits(m, 2) + ":" + document.userscript_global.padDigits(s, 2);
    },
    padDigits: (number, digits) => {
        return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
    },
    logElementEvents: (elm, events = []) => {
        elm.forEach((value) => {
            window.addEventListener(value, function (evt) {
                document.userscript_global.log("logElementEvents", evt.type, evt.currentTarget);
            }, false);
        })
    }
};

(function () {
    'use strict';
    document.userscript_global.init();

    window.addEventListener('load', function () {
        document.userscript_global.bootstrap_version = (typeof bootstrap === 'undefined' ? $().tooltip.Constructor.VERSION : bootstrap.Tooltip.VERSION)
        document.userscript_global.log("GLOBAL FUNCTION", "BOOTSRAP VERSION", document.userscript_global.bootstrap_version);
    }, false);


})();