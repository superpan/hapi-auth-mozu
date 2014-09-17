'use strict';

var Crypto = require('crypto');

module.exports.algorithms = ['sha256'];

module.exports.calculateMac = function(algorithm, secret, date, payload) {
    var digest = null;

    if (module.exports.algorithms.indexOf(algorithm) === -1) {
        return digest;
    }

    var key = new Buffer(secret + secret);

    var raw = Crypto.createHash(algorithm).update(key).digest('base64') + date + payload;

    return Crypto.createHash(algorithm).update(new Buffer(raw)).digest('base64');
};
