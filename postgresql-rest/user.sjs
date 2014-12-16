/**
 * This file handles the /user API endpoint
 */

/*global req, res, require, sql */

function badRequest(message) {
    message = message || "bad request";
    res.send(400, { message: message });
}

function getUser(id) {
    var query = 'SELECT * FROM users WHERE id=' + sql.quote(id);
    var user = sql.getDataRow(query);
    if (user) {
        res.send(200, { user: user });
    }
    else {
        res.send(404, { user: null });
    }
}

function listUsers() {
    var users = sql.getDataRows('SELECT * FROM users ORDER BY "id"');
    res.send(200, { users: users });
}

function updateUser(id, data) {
    var updates = [];
    decaf.each(data, function(value, key) {
        updates.push('"' + key + '" =' + sql.quote(value));
    });
    var query = [
        'update',
        '   users',
        'set',
        '   ' + updates.join(','),
        'where',
        '   id=' + sql.quote(id)
    ].join('\n');
    try {
        sql.update(query);
        res.send(200, { message: 'User updated'});
    }
    catch (e) {
        res.send(500, { message: e.toString() });
    }
}

function createUser(data) {
    var keys = [],
        values = [];
    decaf.each(data, function(value, key) {
        keys.push('"' + key + '"');
        values.push(sql.quote(value));
    });

    console.dir(sql.quote('abc'));
    try {
        var query = [
            'insert into',
            '   users (' + keys.join(',') + ')',
            '   values (' + values.join(',') + ')'
        ].join('\n');
        sql.update(query);
        var id = sql.getScalar('SELECT LASTVAL()');
        res.send(201, { message: 'User created', id: id });
    }
    catch (e) {
        res.send(500, { message: e.toString() });
    }
}

function deleteUser(id) {
    try {
        sql.update([
            'delete from',
            '   users',
            'where',
            '   "id"=' + sql.quote(id)
        ]);
        res.send(200, { message: 'User deleted' });
    }
    catch (e) {
        res.send(500, { message: e.toString() });
    }
}

switch (req.method.toUpperCase()) {
    case 'GET':
        if (req.args.length > 1) {
            badRequest();
        }
        if (req.args[0]) {
            getUser(req.args[0]);
        }
        else {
            listUsers();
        }
        break;
    case 'PUT':
        // PUT /user/:id
        if (req.args.length !== 1) {
            badRequest();
        }
        updateUser(req.args[0], req.post);
        break;
    case 'POST':
        // POST /user
        createUser(req.post);
        break;
    case 'DELETE':
        // DELETE /user/:id
        if (req.args.length !== 1) {
            badRequest();
        }
        deleteUser(req.args[0]);
        break;
    default:
        badRequest('invalid method');
        break;
}
