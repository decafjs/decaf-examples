/**
 * This file handles the /user API endpoint
 */

/*global req, res, require, sql */

var Schema = require('decaf-mysql').Schema;

function getUser(me, id) {
    var user = Schema.findOne('Users', {userId : id});
    if (user.userId) {
        me.send(200, {user : user});
    }
    else {
        me.send(404, {user : null});
    }
}

function listUsers(me) {
    me.send(200, Schema.list('Users', {}));
}

function updateUser(me, id, data) {
    try {
        var user = Schema.putOne('Users', {
            userId    : id,
            firstName : data.firstName,
            lastName  : data.lastName,
            email     : data.email
        });
        me.send(200, { user: user, message : 'User ' + (id ? 'updated' : 'created') });
    }
    catch (e) {
        me.send(500, {message : e.toString()});
    }
}


function deleteUser(me, id) {
    try {
        Schema.remove('Users', { userId: id });
        me.send(200, {message : 'User deleted'});
    }
    catch (e) {
        me.send(500, {message : e.toString()});
    }
}

return {
    // GET /v1/user = list
    // GET /v1/user/:id = get user by id
    'GET': function(id) {
        if (id) {
            getUser(this, id);
        }
        else {
            listUsers(this);
        }
    },
    // PUT /v1/user/:id = update user
    'PUT' : function(id) {
        if (!id) {
            throw new Error('Invalid arguments');
        }
        updateUser(this, id, this.req.post);
    },
    // POST /v1/user = create user
    'POST' : function() {
        updateUser(this, 0, this.req.post);
    },
    // DELETE /v1/user/:id
    'DELETE' : function(id) {
        if (!id) {
            throw new Error('Invalid arguments');
        }
        deleteUser(this, id);
    }
};
