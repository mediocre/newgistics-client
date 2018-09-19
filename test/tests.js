const assert = require('assert');

const cache = require('memory-cache');

const NewgisticsClient = require('../client');

describe('Constructor', function() {
    it('Incoming args should be overlaid on opts', function() {
        var client = new NewgisticsClient({
            api_url: 'some_api_url',
            auth_url: 'some_auth_url',
            clientFacilityId: '9999',
            facilityId: '0000',
            id: 'an_id',
            secret: 'a_secret'
        });

        assert.strictEqual('some_api_url', client.opts.api_url);
        assert.strictEqual('some_auth_url', client.opts.auth_url);
        assert.strictEqual('9999', client.opts.clientFacilityId);
        assert.strictEqual('0000', client.opts.facilityId);
        assert.strictEqual('an_id', client.opts.id);
        assert.strictEqual('a_secret', client.opts.secret);
    });
});

describe('Functionality', function() {
    var client;

    this.timeout(5000);

    before(function() {
        client = new NewgisticsClient({
            api_url: 'https://shippingapi.ncommerce.com/v1/packages',
            auth_url: 'https://authapi.ncommerce.com/connect/token',
            clientFacilityId: process.env.NG_CLIENT_FACILITY_ID,
            facilityId: process.env.NG_FACILITY_ID,
            id: process.env.NG_ID,
            secret: process.env.NG_SECRET
        });
    });

    it('getToken() should return a valid token', function(done) {
        client.getToken(function(err, token) {
            assert.ifError(err);

            assert(token);
            assert(token.access_token);
            assert(token.expires_in);
            assert(token.token_type);

            done();
        });
    });

    it('getToken() should return the same token on subsequent calls', function(done) {
        // Clear existing token
        cache.del('newgistics-client-token');

        client.getToken(function(err, token1) {
            assert.ifError(err);

            client.getToken(function(err, token2) {
                assert.ifError(err);

                assert.deepStrictEqual(token1, token2);

                done();
            });
        });
    });

    it('createPackage() should successfully create a package', function(done) {
        var package = {
            dimensions: {
                length: {
                    unitOfMeasure: 'Inches',
                    measurementValue: '12'
                },
                width: {
                    unitOfMeasure: 'Inches',
                    measurementValue: '8'
                },
                height: {
                    unitOfMeasure: 'Inches',
                    measurementValue: '4'
                },
                girth: {
                    unitOfMeasure: 'Inches',
                    measurementValue: '24'
                },
                isRectangular: true
            },
            returnAddress: {
                name: 'A Mediocre Corporation',
                address1: '1 Meh Lane',
                address2: 'Suite 0',
                city: 'Carrollton',
                stateOrProvince: 'TX',
                postalCode: '75010',
                isResidential: false
            },
            shipToAddress: {
                city: 'Dallas',
                address1: '5531 Willis Ave',
                name: 'Joe User',
                postalCode: '75206',
                stateOrProvince: 'TX'
            },
            weight: {
                unitOfMeasure: 'Pounds',
                measurementValue: '0.5'
            }
        };

        client.createPackage(package, function(err, packageResponse) {
            assert.ifError(err);

            assert(packageResponse.packageId);
            assert(packageResponse.trackingId);
            assert(packageResponse.labels[0].labelData);
            assert(packageResponse.pricingInformation);

            done();
        });
    });
});