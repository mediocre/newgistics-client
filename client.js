const cache = require('memory-cache');
const request = require('request');

function NewgisticsClient(args) {
    var _this = this;

    _this.opts = Object.assign({
        api_url: 'https://shippingapi.ncommerce.com/v1/packages',
        auth_url: 'https://authapi.ncommerce.com/connect/token',
        clientFacilityId: '',
        facilityId: '',
        id: '',
        secret: ''
    }, args);

    _this.authenticate = function(callback) {
        var token = cache.get('newgistics_auth_token');
        if (token !== null) {
            return callback(null, token);
        }

        var authRequest = {
            formData: {
                client_id: _this.opts.id,
                client_secret: _this.opts.secret,
                grant_type: 'client_credentials',
                scope: 'api'
            },
            method: 'POST',
            url: _this.opts.auth_url
        };

        request(authRequest, function(err, res, body) {
            if (err) {
                return callback(err);
            }

            var jsonBody = JSON.parse(body);
            const expiresIn = Number(jsonBody.expires_in);
            token = jsonBody.access_token;

            if (!token || !expiresIn) {
                return callback(new Error('Unable to authenticate with Newgistics (token or expiry not received)'));
            }

            cache.put('newgistics_auth_token', token, expiresIn / 2);
            return callback(null, token);
        });
    };

    _this.createPackage = function(package, callback) {
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

        _this.authenticate(function(err, token) {
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
                clientFacilityId: _this.opts.clientFacilityId,
                correctAddress: false,
                dimensions: package.dimensions,
                hazmatClasses: [],
                labelFormat: 'ZPL',
                ngsFacilityId: _this.opts.facilityId,
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
                    bearer: token
                },
                json: rateRequestData,
                method: 'POST',
                url: _this.opts.api_url
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

    return _this;
}

module.exports = NewgisticsClient;