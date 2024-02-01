const JSConsole = {
    ws: null,
    init: (host = "127.0.0.1", port = 8080) => {
        JSConsole.ws = new WebSocket(`ws://${host}:${port}`);
        JSConsole.ws.onopen = () => {
            console.log("JSConsole: onopen")
        }
        JSConsole.ws.onmessage = (event) => {
            console.log("JSConsole: onmessage: ", event.data)
        }
        JSConsole.ws.onclose = () => {
            console.log("JSConsole: onclose")
        }
        JSConsole.ws.onerror = (event) => {
            console.log("JSConsole: onclose", event)
        }

    },
    send: (_type, _data) => {
        JSConsole.ws.send(JSON.stringify(
            {
                master: "JSConsole",
                type: _type,
                data: _data,
                line: 0,
                href: window.location.href
            }
        ))
    },
    info: (data) => {
        JSConsole.send("info", data);
    }
}
JSConsole.init();
