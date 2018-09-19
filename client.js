const cache = require('memory-cache');
const request = require('request');

function NewgisticsClient(args) {
    var opts = Object.assign({
        authapi_url: 'https://authapi.ncommerce.com',
        client_id: '',
        client_secret: '',
        clientFacilityId: '',
        facilityId: '',
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
        if (!package.returnAddress || !package.returnAddress.name || !package.returnAddress.address1 || !package.returnAddress.postalCode || !package.returnAddress.city || !package.returnAddress.stateOrProvince) {
            return callback(new Error('Package ReturnAddress object missing required properties (name, address1, city, stateOrProvince, postalCode are required)'));
        }

        if (!package.shipToAddress || !package.shipToAddress.name || !package.shipToAddress.address1 || !package.shipToAddress.postalCode || !package.shipToAddress.city || !package.shipToAddress.stateOrProvince) {
            return callback(new Error('Package ShipToAddress object missing required properties (name, address1, city, stateOrProvince, postalCode are required)'));
        }

        if (!package.dimensions || !package.dimensions.length || !package.dimensions.width || !package.dimensions.height || !package.dimensions.girth) {
            return callback(new Error('Package Dimensions object missing required properties (length, width, height and girth are required)'));
        }

        if (!package.weight) {
            return callback(new Error('Package object missing required property (weight)'));
        }

        this.getToken(function(err, token) {
            if (err) {
                return callback(err);
            }

            const addressDefaults = {
                country: 'US',
                isResidential: true
            };

            var rateRequestData = {
                additionalServices: [
                    'DeliveryConfirmation'
                ],
                classOfService: 'Ground',
                clientFacilityId: opts.clientFacilityId,
                correctAddress: false,
                dimensions: package.dimensions,
                hazmatClasses: [],
                labelFormat: 'ZPL',
                ngsFacilityId: opts.facilityId,
                PricePackage: true,
                referenceNumbers: [],
                returnAddress: Object.assign({}, addressDefaults, package.returnAddress),
                returnService: 'AddressServiceRequested',
                shipToAddress: Object.assign({}, addressDefaults, package.shipToAddress),
                verifyAddress: true,
                weight: package.weight
            };

            var rateRequest = {
                auth: {
                    bearer: token.access_token
                },
                json: rateRequestData,
                method: 'POST',
                url: opts.api_url
            };

            request(rateRequest, function(err, res, body) {
                if (err) {
                    return callback(err);
                }

                if (!body) {
                    return callback(new Error('No response received from Newgistics'));
                }

                if (body.error) {
                    return callback(new Error(body.error.message));
                }

                callback(null, body.data);
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