/**
 * Created by mschwartz on 1/19/15.
 */

/*global exports, require */

var { setTimeout, clearTimeout}  = require('Timers');

const Transport = {
    CONNECTING : 0,
    OPEN       : 1,
    CLOSING    : 2,
    CLOSED     : 3
};

function closeFrame(status, reason) {
    return 'c' + JSON.stringify([status, reason]);
}

function SockJSConnection(session) {
    this.session = session;
    this.id = uuid();
    this.headers = {};
    this.prefix = session.prefix;
}
decaf.extend(SockJSConnection, {
    toString    : function () {
        return '<SockJSConnection ' + this.id + '>'
    },
    write       : function (string) {
        return this.session.send('' + string);
    },
    end         : function (string) {
        if (string) {
            this.write(string);
            this.close();
            return null;
        }
    },
    close       : function (code, reason) {
        this.session.close(code, reason);
    },
    destroy     : function () {
        this.end();
    },
    destroySoon : function () {
        this.destroy();
    },
    get readable() {
        return this.session.readyState === Transport.OPEN;
    },
    get writable() {
        return this.session.readyState === Transport.OPEN;
    },
    get readyState() {
        return this.session.readyState;
    }
});

var map = {};

function Session(sessionId, server) {
    var me = this,
        options = server.options;

    decaf.extend(me, {
        sessionId        : sessionId,
        heartbeat_delay  : options.heartbeat_delay,
        disconnect_delay : options.disconnect_delay,
        prefix           : options.prefix,
        send_buffer      : [],
        isClosing        : false,
        readyState       : Transport.CONNECTING,
        timeout_cb       : function () {
            me.didTimeout()
        },
        to_tref          : setTimeout(me.timeout_cb, me.disconnect_delay),
        connection       : new SockJSConnection(me),
        emit_open        : function () {
            me.emit_open = null;
            server.fire('connection', me.connection);
        }

    });

    if (this.sessionId) {
        map[sessionId] = this;
    }
}
decaf.extend(Session.prototype, {
    register           : function (req, recv) {
        var me = this;
        if (me.recv) {
            recv.doSendFrame(closeFrame(210, "Another connection still open"));
            recv.didClose();
            return;
        }
        if (me.to_tref) {
            clearTimeout(me.to_tref);
            me.to_tref = null;
        }
        if (me.readyState === Transport.CLOSING) {
            me.flushToRecv(recv);
            recv.doSendFrame(me.close_frame);
            recv.didClose();
            me.to_tref = setTimeout(this.timeout_cb, me.disconnect_delay);
            return;
        }
        // Registering.  From now on  'unregister' is responsible for setting the timer.
        this.recv = recv;
        this.recv.session = this;
        // Save parameters from request
        me.decorateConnection(req);

        // first send the open frame
        if (me.readyState === Transport.CONNECTING) {
            me.recv.doSendFrame('o');
            if (me.emit_open) {
                me.emit_open();
            }
        }

        // At this point the transport might have gotten away (jsonp)
        if (!me.recv) {
            return;
        }
        me.tryFlush();
    },
    decorateConnection : function (req) {
        var me = this,
            connection = me.connection,
            remoteAddress,
            remotePort,
            address;

        var socket = me.recv.connection || me.recv.response.connection;
        try {
            remoteAddress = socket.remoteAddress();
            remotePort = socket.remotePort;
            address = socket.address();

        }
        catch (x) {
        }
        if (remoteAddress) {
            connection.remoteAdddress = remoteAddress;
            connection.remotePort = remotePort;
            connection.address = address;
        }
        connection.url = req.uri;
        connection.pathname = req.uri;
        connection.protocol = req.protocol;     // e.g. xhr-polling

        var headers = {};
        for (var key in ['referer', 'x-client-ip', 'x-forwarded-for', 'x-cluster-client-ip', 'via', 'x-real-ip', 'host', 'user-agent', 'accept-language']) {
            if (req.headers[key] !== undefined) {
                headers[key] = req.headers[key];
                hasHeaders = true;
            }
        }
        connection.headers = headers;
    },
    unregister         : function () {
        this.recv.session = null;
        this.recv = null;
        if (this.to_tref) {
            clearTimeout(this.to_tref);
        }
        this.to_tref = setTimeout(this.timeout_cb, this.disconnect_delay);
    },
    flushToRecv        : function (recv) {
        if (this.send_buffer.length) {
            var sb = this.send_buffer;
            this.send_buffer = [];
            recv.doSendBulk(sb);
            return true;
        }
        return false;
    },
    tryFlush           : function () {
        var me = this;

        if (!me.flushToRecv(me.recv) || !me.to_tref) {
            if (me.to_tref) {
                clearTimeout(me.to_tref);
            }
            function x() {
                if (me.recv) {
                    me.to_tref = setTimeout(x, me.heartbeat_delay);
                    me.recv.doSendFrame('h');
                }
            }

            me.to_tref = setTimeout(x, me.heartbeat_delay);
        }
    },
    didTimeout         : function () {
        var me = this;
        if (me.to_tref) {
            claerTimeout(me.to_tref);
        }
        me.to_tref = null;
        switch (me.readyState) {
            case Transport.CONNECTING:
            case Transport.OPEN:
            case Transport.CLOSING:
                break;
            default:
                throw new Error('INVALID_STATE_ERR');
        }
        if (me.recv) {
            throw new Error('RECV_STILL_THERE');
        }
        me.readyState = Transport.CLOSED;
        me.connection.fire('end');
        me.conneciton.fire('close');
        if (me.sessionId) {
            delete map[me.sessionId];
            me.sessionId = null;
        }
    },
    didMessage         : function (payload) {
        var me = this;

        if (@readyState === Transport.OPEN) {
            me.connection.emit('data', payload);
        }
    },
    send               : function (payload) {
        var me = this;

        if (me.readyState !== Transport.OPEN) {
            return false;
        }
        me.send_buffer.push('' + payload);
        if (me.recv) {
            me.tryFlush();
        }
        return true;
    },
    close              : function (status, reason) {
        var me = this;

        if (status === undefined) {
            status = 1000;
        }
        if (reason === undefined) {
            reason = "Normal closure";
        }
        if (me.readyState !== Transport.OPEN) {
            return false;
        }
        me.readyState = Transport.CLOSING;
        me.close_frame = closeFrame(status, reason);
        if (me.recv) {
            // Go away, doSendFrame can trigger didClose which can
            // trigger unregister.  Make sure me.recv is not null.
            me.recv.doSendFrame(me.close_frame);
        }
        if (me.recv) {
            me.unregister();
        }
        return true;
    },
    bySessionId        : function (sessionId) {
        if (!sessionId) {
            return null;
        }
        return map[sessionId] || null;
    }

});

function register(erq, server, sessionId, receiver) {
    var session = Session.bySessionid(sessionId) || new Session(sessionId, server);
    session.regsteer(req, receiver);
    return session;
}
exports.register = function (req, server, receiver) {
    register(req, server, req.session, receiver);
};
exports.registerNoSession = function (req, server, receiver) {
    register(req, server, undefined, receiver);
};

function GenericReceiver(thingy) {
    this.thingy = thingy;
    this.setup(this.thingy);
}
decaf.extend(GenericReceiver.prototype, {
    setup      : function (thingy) {
        var me = this;

        me.thingy_end_cb = function () {
            me.didAbort()
        };
        me.thingy.addListener('close', me.thingy_end_cb);
        me.thingy.addListener('end', me.thingy_end_cb);
    },
    tearDown   : function () {
        var me = this;

        me.thingy.removeListener('close', me.thingy_end_cb);
        me.thingy.removeListener('end', me.thingy_end_cb);
        me.thingy_end_cb = null;
    },
    didAbort   : function () {
        var me = this,
            session = me.session;

        me.didClose();
        if (session) {
            session.didTimeout();
        }
    },
    didClose   : function () {
        var me = this;

        if (me.thingy) {
            me.tearDown(me.thingy);
            me.thingy = null;
        }
        if (me.session) {
            me.session.unregister();
        }
    },
    doSendBulk : function (messages) {
        var me = this,
            q_msgs = [];

        decaf.each(messages, function (message) {
            q_msgs.push(utils.quote(message));
        });
        me.doSendFrame('a[' + q_msgs.join(',') + ']');
    }
});

function ResponseReceiver(request, response, options) {
    var me = this;

    me.prototype = GenericReceiver.prototype;
    me.extend({
        request            : request,
        response           : response,
        options            : options,
        max_response_size  : undefined,
        curr_response_size : 0
    });
    try {
        me.request.connection.setKeepAlive(true, 5000);
    }
    catch (x) {
    }
    GenericReceiver.call(me.request.connection);
    if (me.max_response_size === undefined) {
        me.max_response_size = me.options.max_response_size;
    }
    me.doSendFrame = function (payload) {
        var me = this;

        me.curr_response_size += payload.length;
        var r = false;
        try {
            me.response.write(payload);
            r = true;
        }
        catch (x) {
        }
        if (me.max_response_size && me.curr_response_size >= me.max_response_size) {
            me.didClose();
        }
        return r;
    };
    me.didClose = function () {
        var me = this;

        me.prototype.didClose();
        try {
            me.response.end();
        }
        catch (x) {
        }
        me.response = null;
    };
}

decaf.extend(exports, {
    GenericReceiver  : GenericReceiver,
    Transport        : Transport,
    Session          : Session,
    ResponseReceiver : ResponseReceiver,
    SockJSConnection : SockJSConnection
});
