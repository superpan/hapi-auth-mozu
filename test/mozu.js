'use strict';

var assert = require('chai').assert;
var Hapi = require('hapi');

describe('Mozu', function() {
    this.timeout(5000);
    var server = null;

    before(function(next) {
        server = new Hapi.Server();

        server.pack.register(require('../'), function(err) {
            assert.isUndefined(err);
            // register auth
            server.auth.strategy('default', 'mozu', {
                sharedSecret: 'cb966f44cfc44e29a01049da98f99163'
            });
            // install test route
            server.route({
                method: 'POST',
                path: '/mozu',
                handler: function(request, reply) {
                    reply('success');
                },
                config: {
                    auth: {
                        mode: 'required',
                        strategies: ['default'],
                        payload: true
                    }
                }
            });

            return next();
        });
    });

    it('should authenticate', function(done) {

        // create request
        var request = {
            method: 'POST',
            url: 'http://test.com/mozu',
            headers: {
                Date: 'Wed, 17 Sep 2014 03:07:13 GMT',
                'X-Vol-Hmac-Sha256': 'tlV4+aE+4mxCji8jZ4PIKz30q18PtV11n0AT9PGd9vM='
            },
            payload: '{"eventId":"aa8494c2-8640-47c0-96ca-a3a900336ca8","topic":"product.created","entityId":"5418fadf13dfa10b1b074cb1","timestamp":"2014-09-17T03:07:13.5655802Z","correlationId":"9902d7e03d9945918ee563f488435f16","isTest":false}'
        };

        // simulate request
        server.inject(request, function(res) {
            assert.equal(res.statusCode, 200);
            assert.equal(res.result, 'success');
            return done();
        });
    });

    it('should fail authentication', function(done) {

        // create request
        var request = {
            method: 'POST',
            url: 'http://test.com/mozu',
            headers: {
                Date: 'Wed, 17 Sep 2014 03:07:13 GMT',
                'X-Vol-Hmac-Sha256': 'tlV4+aE+4mxCji8jZ4PIKz30q18PtV11n0AT9PGd9vM='
            },
            payload: '{"eventId":"aa8494c2-8640-47c0-96ca-a3a900336ca8","topic":"product.created","entityId":"5418fadf13dfa10b1b074cb1","timestamp":"2014-09-17T03:07:13.5655802Z","correlationId":"9902d7e03d9945918ee563f488435f16"}'
        };

        // simulate request
        server.inject(request, function(res) {
            assert.equal(res.statusCode, 401);
            return done();
        });
    });
});
