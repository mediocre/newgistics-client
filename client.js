const cache = require('memory-cache');
const request = require('request');

function NewgisticsClient(args) {
    var opts = Object.assign({
        authapi_url: 'https://authapi.ncommerce.com',
        client_id: '',
        client_secret: '',
        shippingapi_url: 'https://shippingapi.ncommerce.com'
    }, args);

    this.closeout = function(merchantId, ngsFacilityIds, callback) {
        // ngsFacilityIds are optional
        if (!callback) {
            callback = ngsFacilityIds;
            ngsFacilityIds = undefined;
        }

        this.getToken(function(err, token) {
            if (err) {
                return callback(err);
            }

            const json = {};

            if (ngsFacilityIds) {
                json.NgsFacilityIds = ngsFacilityIds;
            }

            const req = {
                auth: {
                    bearer: token.access_token
                },
                json,
                method: 'POST',
                url: `${opts.shippingapi_url}/v1/closeout/${merchantId}`
            };

            request(req, function(err, res, body) {
                if (err) {
                    return callback(err);
                }

                if (body && body.error) {
                    return callback(new Error(body.error.message));
                }

                if (res.statusCode !== 200) {
                    return callback(new Error(`${res.statusCode} ${res.request.method} ${res.request.href} ${res.body}`));
                }

                callback();
            });
        });
    };

    this.createPackage = function(package, callback) {
        this.getToken(function(err, token) {
            if (err) {
                return callback(err);
            }

            const req = {
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

                if (package && package.error) {
                    return callback(new Error(package.error.message));
                }

                if (res.statusCode !== 200) {
                    return callback(new Error(`${res.statusCode} ${res.request.method} ${res.request.href} ${res.body}`));
                }

                callback(null, package.data);
            });
        });
    };

    this.getToken = function(callback) {
        // Try to get the token from memory cache
        const token = cache.get('newgistics-client-token');

        if (token) {
            return callback(null, token);
        }

        const req = {
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

            if (token && token.error) {
                return callback(new Error(token.error));
            }

            if (res.statusCode !== 200) {
                return callback(new Error(`${res.statusCode} ${res.request.method} ${res.request.href} ${res.body}`));
            }

            // Put the token in memory cache
            cache.put('newgistics-client-token', token, token.expires_in / 2);

            callback(null, token);
        });
    };

    this.ping = function(callback) {
        const req = {
            json: true,
            method: 'GET',
            url: `${opts.shippingapi_url}/ping`
        };

        request(req, function(err, res, pong) {
            if (err) {
                return callback(err);
            }

            if (res.statusCode !== 200) {
                return callback(new Error(`${res.statusCode} ${res.request.method} ${res.request.href} ${res.body}`));
            }

            callback(null, pong);
        });
    };
}

module.exports = NewgisticsClient;