/**
 * Created by mschwartz on 2/4/15.
 */

/*global require */

var Application  = require('decaf-jolt').Application,
    StaticFile   = require('decaf-jolt-static').StaticFile,
    StaticServer = require('decaf-jolt-static').StaticServer,
    RiotServer   = require('decaf-jolt-riot').RiotServer,
    app          = new Application();

app.verb('/', new StaticFile('index.html'));
app.verb('bower_components', new StaticServer('bower_components'));
app.verb('tags', new RiotServer('tags'));

app.listen(9090, '0.0.0.0');
console.log('app running on port 9090');
