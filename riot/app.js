/**
 * Created by mschwartz on 2/4/15.
 */

/*global require */

require.paths.unshift('lib');

var Application  = require('decaf-jolt').Application,
    SjsFile      = require('decaf-jolt-sjs').SjsFile,
    StaticFile   = require('decaf-jolt-static').StaticFile,
    StaticServer = require('decaf-jolt-static').StaticServer,
    RiotServer   = require('decaf-jolt-riot').RiotServer,
    app          = new Application();

app.verb('/', new SjsFile('controllers/home.sjs'));
app.verb('bower_components', new StaticServer('bower_components'));
app.verb('tags', new RiotServer('tags'));

app.listen(9090, '0.0.0.0');
console.log('app running on port 9090');
