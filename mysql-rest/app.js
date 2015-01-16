/**
 * Created by mschwartz on 12/15/14.
 */

var MySQL = require('decaf-mysql').MySQL,
Schema    = require('decaf-mysql').Schema;

// sql singleton will be available to all the http child threads
global.SQL = new MySQL({
    user     : 'mschwartz',
    password : '',
    database : 'rest_example'
});

Schema.add({
    name       : 'Users',
    fields     : [
        {name : 'userId', type : 'int', autoIncrement : true},
        {name : 'firstName', type : 'varchar', size : 32},
        {name : 'lastName', type : 'varchar', size : 32},
        {name : 'email', type : 'varchar', size : 64},
    ],
    primaryKey : 'userId',
    indexes    : [
        'email'
    ]
});

var Application  = require('decaf-jolt').Application,
    StaticFile   = require('decaf-jolt-static').StaticFile,
    StaticServer = require('decaf-jolt-static').StaticServer,
    //SjsFile      = require('decaf-jolt-sjs').SjsFile,
    RestServer   = require('decaf-jolt-rest').RestServer,
    app          = new Application();

app.verb('/', new StaticFile('index.html'));
app.verb('bower_components', new StaticServer('bower_components'));

// install RESTful API at /v1
app.verb('v1', new RestServer({
    user : 'api/v1/user.sjs' // REST handlers for /v1/user route
}));

app.listen(9090, '0.0.0.0');
console.log('app running on port 9090');
