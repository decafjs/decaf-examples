/**
 * Created by mschwartz on 1/19/15.
 */

/**
 * @fileoverview program to test implementation of WebSocket
 */

/*global require, WebSocket */

var http = require('http'),
    {setInterval, clearInterval} = require('Timers'),
    {LogFile} = require('logfile');

function tester() {
    var myWebSocket = new WebSocket("ws://localhost:1337/test");
    myWebSocket.onopen = function() {
        var s = [];
        for (var n=0; n<10000; n++) {
            s.push(n);
        }
        myWebSocket.send(s.join(','));
        for (var i = 1; i < 11; i++) {
            console.log('here ' + i);
            myWebSocket.send('hello ' + i);
        }
    };
    myWebSocket.onmessage = function(event) {
        console.log(event.data);
//        myWebSocket.send('pong');
    };
    myWebSocket.onclose = function() {
        console.log('websocket close');
    };
}

var html = [
    '<html>',
    '<head>',
    '<title>WebSocket Test</title>',
    '<script type="text/javascript">',
    tester,
    '</script>',
    '</head>',
    '<body>',
    '<script type="text/javascript">',
    'tester()',
    '</script>',
    '</body>',
    '</html>'
];

var logfile = new LogFile('/tmp/log.file', 1, true);
http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type' : 'text/html'});
    res.end(html.join('\n'));
}).listen(1337, '127.0.0.1', 50).webSocket('test', function(ws) {
    logfile.println('WebSocket alive');
    ws.broadcast('/test', 'Another joined');
    var handle = setInterval(function() {
        logfile.println('ping ' + ws.uuid);
        ws.sendMessage('ping');
        ws.ping();
    }, 1000);
    ws.on('message', function(message) {
        console.log(message);
        logfile.println(message);
        ws.sendMessage('goodbye ' + message);
    });
    ws.on('close', function() {
        clearInterval(handle);
        ws.broadcast('/test', 'Another quit');
        logfile.println('close');
        console.log('close')
    });
});

console.log('Server running at http://127.0.0.1:1337/');
