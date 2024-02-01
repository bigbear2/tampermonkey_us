'use strict';

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 5013 });

wss.on('connection', function connection(ws) {
    ws.on('message', function onMessage(message) {
        console.log(message);
    });
});


ws.onopen = () => {
    console.log("onopen")

    ws.send(JSON.stringify(
        {
            master: "JSConsole",
            type: "info",
            data: {"givenName": "Vas", "surName": "Sudanagunta"}
        }
    ))

    /*  ws.send(JSON.stringify(
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
      ))*/
}
ws.onclose = () => {
    console.log("onclose")
}