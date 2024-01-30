var ws = new WebSocket("ws://127.0.01:8080")
ws.onmessage = (event) => {
    console.log("onmessage: ", event.data)
}
ws.onopen = () => {
    console.log("onopen")
    ws.send(JSON.stringify(
        {
            command: "connect",
            host: "feling.net",
            port: 80
        }
    ))
    ws.send(JSON.stringify(
        {
            command: "send",
            data: "GET / HTTP/1.1\r\nHost: feling.net\r\nConnection: close\r\n\r\n"
        }
    ))
}
ws.onclose = () => {
    console.log("onclose")
}


var ws_server = new WebSocket("ws://127.0.01:8080");
