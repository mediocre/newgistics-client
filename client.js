const cache = require('memory-cache');
const request = require('request');

function NewgisticsClient(args) {
    var opts = Object.assign({
        authapi_url: 'https://authapi.ncommerce.com',
        client_id: '',
        client_secret: '',
        shippingapi_url: 'https://shippingapi.ncommerce.com'
    }, args);

    this.getToken = function(callback) {
        // Try to get the token from memory cache
        var token = cache.get('newgistics-client-token');

        if (token) {
            return callback(null, token);
        }

        var req = {
            formData: {
                client_id: opts.client_id,
                client_secret: opts.client_secret,
                grant_type: 'client_credentials',
                scope: 'api'
            },
            json: true,
            method: 'POST',
            url: `${opts.authapi_url}/connect/token`
        };

        request(req, function(err, res, token) {
            if (err) {
                return callback(err);
            }

            if (token.error) {
                return callback(new Error(token.error));
            }

            // Put the token in memory cache
            cache.put('newgistics-client-token', token, token.expires_in / 2);

            callback(null, token);
        });
    };

    this.createPackage = function(package, callback) {
        this.getToken(function(err, token) {
            if (err) {
                return callback(err);
            }

            var req = {
                auth: {
                    bearer: token.access_token
                },
                json: package,
                method: 'POST',
                url: `${opts.shippingapi_url}/v1/packages`
            };

            request(req, function(err, res, package) {
                if (err) {
                    return callback(err);
                }

                if (package.error) {
                    return callback(new Error(package.error.message));
                }

                callback(null, package.data);
            });
        });
    };

    this.ping = function(callback) {
        var req = {
            json: true,
            method: 'GET',
            url: `${opts.shippingapi_url}/ping`
        };

        request(req, function(err, res, pong) {
            callback(err, pong);
        });
    };
}

module.exports = NewgisticsClient;