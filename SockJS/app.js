/**
 * Created by mschwartz on 12/15/14.
 */

/*global require, global */

var SockJS       = require('decaf-jolt-sockjs').SockJS,
    Application  = require('decaf-jolt').Application,
    StaticFile   = require('decaf-jolt-static').StaticFile,
    StaticServer = require('decaf-jolt-static').StaticServer,
    //SjsFile      = require('decaf-jolt-sjs').SjsFile,
    //RestServer   = require('decaf-jolt-rest').RestServer,
    app          = new Application(),
    sockjs       = new SockJS(app, 'echo'),
    {setInterval, clearInterval}  = require('Timers');

app.verb('/', new StaticFile('index.html'));
app.verb('bower_components', new StaticServer('bower_components'));

sockjs.on('open', function (sock) {
    console.log('==== open ====');
    var i = 1;
    var id = setInterval(function () {
        var s = 'ping ' + i++;
        console.log(s);
        sock.send(s);
    }, 1000);
    sock.on('close', function () {
        console.log('==== close ====');
        if (id !== false) {
            clearInterval(id);
        }
        id = false;
    });
    sock.on('message', function (message) {
        console.log('==== message ====');
        console.dir({
            message : message
        });
        sock.send(message);
    });
});

app.listen(8081, '0.0.0.0');
console.log('app running on port 8081');
