'use strict';
var Boom = require('boom');
var Hoek = require('hoek');

var Crypto = require('./crypto');
var internals = {};

exports.register = function(plugin, options, next) {
    plugin.auth.scheme('mozu', internals.mozu);
    return next();
};

// register attributes
exports.register.attributes = {
    pkg: require('../package.json')
};

internals.mozu = function(server, options) {
    Hoek.assert(options, 'invalid options');
    Hoek.assert(options.sharedSecret, 'missing required shared secret');

    var scheme = {
        authenticate: function(request, reply) {
            var digest = null;
            var payload = null;

            if (!request.headers.date || !request.headers['x-vol-hmac-sha256']) {
                return reply(Boom.badRequest('missing required headers'));
            }

            request.once('peek', function(chunk) {
                payload = chunk;
                request.on('peek', function(chunk) {
                    payload += chunk;
                });

                request.once('finish', function() {
                    digest = Crypto.calculateMac('sha256', options.sharedSecret, request.headers.date, payload.toString());
                    // TODO, switch to use plugin.expose
                    request.plugins['hapi-auth-mozu'] = {
                        payloadHash: digest
                    };
                });
            });

            return reply(null, {
                credentials: {},
                artifacts: {
                    hash: request.headers['x-vol-hmac-sha256']
                }
            });
        },
        payload: function(request, next) {
            if (!request.auth.artifacts.hash) {
                return next(false);
            }

            if (request.plugins['hapi-auth-mozu'] && request.plugins['hapi-auth-mozu'].payloadHash === request.auth.artifacts.hash) {
                return next();
            }

            return next(Boom.unauthorized('invalid payload'));
        }
    };

    return scheme;
};
