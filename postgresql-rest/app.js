/**
 * Created by mschwartz on 12/15/14.
 */

var PostgreSQL = require('decaf-postgresql').PostgreSQL;

// sql singleton will be available to all the http child threads
global.sql = new PostgreSQL({
    user     : 'mschwartz',
    password : '',
    database : 'rest'
});

sql.update([
    'CREATE TABLE IF NOT EXISTS users (',
    '   "id" serial,',
    '   "firstName" varchar(32),',
    '   "lastName" varchar(32),',
    '   "email" varchar(64)',
    ')'
]);

var Application = require('decaf-jolt').Application,
    StaticFile = require('decaf-jolt-static').StaticFile,
    StaticServer = require('decaf-jolt-static').StaticServer,
    SjsFile = require('decaf-jolt-sjs').SjsFile,
    app = new Application();

app.verb('/', new StaticFile('index.html'));
app.verb('bower_components', new StaticServer('bower_components'));
app.verb('user', new SjsFile('user.sjs'));

app.listen(9090, '0.0.0.0');
console.log('app running on port 9090');
