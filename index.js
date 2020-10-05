const cache = require('memory-cache');
const createError = require('http-errors');
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

                if (res.statusCode !== 200) {
                    return callback(createError(res.statusCode, body && body.error && body.error.message));
                }

                callback();
            });
        });
    };

    this.createPackage = function(_package, callback) {
        this.getToken(function(err, token) {
            if (err) {
                return callback(err);
            }

            const req = {
                auth: {
                    bearer: token.access_token
                },
                json: _package,
                method: 'POST',
                url: `${opts.shippingapi_url}/v1/packages`
            };

            request(req, function(err, res, body) {
                if (err) {
                    return callback(err);
                }

                if (res.statusCode !== 200) {
                    return callback(createError(res.statusCode, body && body.error && body.error.message));
                }

                callback(null, body.data);
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

        request(req, function(err, res, body) {
            if (err) {
                return callback(err);
            }

            if (res.statusCode !== 200) {
                return callback(createError(res.statusCode, body && body.error));
            }

            // Put the token in memory cache
            cache.put('newgistics-client-token', body, body.expires_in / 2);

            callback(null, body);
        });
    };

    this.ping = function(callback) {
        const req = {
            json: true,
            method: 'GET',
            url: `${opts.shippingapi_url}/ping`
        };

        request(req, function(err, res, body) {
            if (err) {
                return callback(err);
            }

            if (res.statusCode !== 200) {
                return callback(createError(res.statusCode, res.body));
            }

            callback(null, body);
        });
    };

    this.reprintPackage = function(packageId, callback) {
        this.getToken(function(err, token) {
            if (err) {
                return callback(err);
            }

            const req = {
                auth: {
                    bearer: token.access_token
                },
                json: {},
                method: 'POST',
                url: `${opts.shippingapi_url}/v1/packages/${packageId}/reprint`
            };

            request(req, function(err, res, body) {
                if (err) {
                    return callback(err);
                }

                if (res.statusCode !== 200) {
                    return callback(createError(res.statusCode, body && body.error && body.error.message));
                }

                callback(null, body.data);
            });
        });
    };

    this.reprintTracking = function(trackingNumber, callback) {
        this.getToken(function(err, token) {
            if (err) {
                return callback(err);
            }

            const req = {
                auth: {
                    bearer: token.access_token
                },
                json: {},
                method: 'POST',
                url: `${opts.shippingapi_url}/v1/packages/trackingId/${trackingNumber}/reprint`
            };

            request(req, function(err, res, body) {
                if (err) {
                    return callback(err);
                }

                if (res.statusCode !== 200) {
                    return callback(createError(res.statusCode, body && body.error && body.error.message));
                }

                callback(null, body.data);
            });
        });
    };

    this.voidPackage = function(packageId, callback) {
        this.getToken(function(err, token) {
            if (err) {
                return callback(err);
            }

            const req = {
                auth: {
                    bearer: token.access_token
                },
                json: {},
                method: 'POST',
                url: `${opts.shippingapi_url}/v1/packages/${packageId}/void`
            };

            request(req, function(err, res, body) {
                if (err) {
                    return callback(err);
                }

                if (res.statusCode !== 200) {
                    return callback(createError(res.statusCode, body && body.error && body.error.message));
                }

                callback();
            });
        });
    };

    this.voidTracking = function(trackingNumber, callback) {
        this.getToken(function(err, token) {
            if (err) {
                return callback(err);
            }

            const req = {
                auth: {
                    bearer: token.access_token
                },
                json: {},
                method: 'POST',
                url: `${opts.shippingapi_url}/v1/packages/trackingId/${trackingNumber}/void`
            };

            request(req, function(err, res, body) {
                if (err) {
                    return callback(err);
                }

                if (res.statusCode !== 200) {
                    return callback(createError(res.statusCode, body && body.error && body.error.message));
                }

                callback();
            });
        });
    };
}

module.exports = NewgisticsClient;