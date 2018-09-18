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
        if (!package || !package.name || !package.address1 || !package.postalCode || !package.city || !package.state) {
            return callback(new Error('Package object missing required properties (name, address1, city, state, postalCode are required)'));
        }

        if (!package.length || !package.width || !package.height || !package.weight) {
            return callback(new Error('Package object missing required properties (length, width, height and weight are required)'));
        }

        _this.authenticate(function(err, token) {
            if (err) {
                return callback(err);
            }

            var shortestTwoDims = [ Number(package.length), Number(package.width), Number(package.height) ].sort((a, b) => b - a).slice(-2);
            var girth = (shortestTwoDims[0] + shortestTwoDims[1]) * 2;

            var rateRequestData = {
                PricePackage: true,
                clientFacilityId: _this.opts.clientFacilityId,
                ngsFacilityId: _this.opts.facilityId,
                returnAddress: {
                    name: _this.opts.returnAddress.name,
                    address1: _this.opts.returnAddress.address1,
                    address2: _this.opts.returnAddress.line2,
                    city: _this.opts.returnAddress.city,
                    stateOrProvince: _this.opts.returnAddress.state,
                    postalCode: _this.opts.returnAddress.postalCode,
                    country: _this.opts.returnAddress.country || 'US',
                    isResidential: _this.opts.returnAddress.isResidential || false
                },
                additionalServices: [
                    'DeliveryConfirmation'
                ],
                returnService: 'AddressServiceRequested',
                classOfService: 'Ground',
                referenceNumbers: [],
                labelFormat: 'ZPL',
                verifyAddress: true,
                correctAddress: false,
                hazmatClasses: []
            };

            rateRequestData.dimensions = {
                length: {
                    unitOfMeasure: 'Inches',
                    measurementValue: package.length.toString()
                },
                width: {
                    unitOfMeasure: 'Inches',
                    measurementValue: package.width.toString()
                },
                height: {
                    unitOfMeasure: 'Inches',
                    measurementValue: package.height.toString()
                },
                girth: {
                    unitOfMeasure: 'Inches',
                    measurementValue: girth.toString()
                },
                isRectangular: true
            },

            rateRequestData.shipToAddress = {
                name: package.name,
                address1: package.address1,
                city: package.city,
                stateOrProvince: package.state,
                postalCode: package.postalCode,
                country: package.country || 'US',
                isResidential: package.isResidential || false
            };

            rateRequestData.weight = {
                unitOfMeasure: 'Pounds',
                measurementValue: package.weight.toFixed(2)
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

                //console.log(token);
                console.log(JSON.stringify(body));

                if (!body || !body.data) {
                    return callback(new Error('No response received from Newgistics'));
                }

                callback(null, body.data);
            });
        });
    };

    return _this;
}

module.exports = NewgisticsClient;