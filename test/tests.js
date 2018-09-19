const assert = require('assert');

const cache = require('memory-cache');

const NewgisticsClient = require('../client');

describe('NewgisticsClient.getToken', function() {
    this.timeout(5000);

    var newgisticsClient;

    before(function() {
        newgisticsClient = new NewgisticsClient({
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET
        });
    });

    it('should return an error', function(done) {
        var invalidClient = new NewgisticsClient({
            auth_url: 'invalid'
        });

        invalidClient.getToken(function(err, token) {
            assert(err);

            assert.strictEqual(token, undefined);

            done();
        });
    });

    it('should return an invalid_client error', function(done) {
        var invalidClient = new NewgisticsClient({
            client_id: 'invalid'
        });

        invalidClient.getToken(function(err, token) {
            assert(err);

            assert.strictEqual(err.message, 'invalid_client');
            assert.strictEqual(token, undefined);

            done();
        });
    });

    it('should return a valid token', function(done) {
        newgisticsClient.getToken(function(err, token) {
            assert.ifError(err);

            assert(token);
            assert(token.access_token);
            assert(token.expires_in);
            assert(token.token_type);

            done();
        });
    });

    it('should return the same token on subsequent calls', function(done) {
        // Clear existing token
        cache.del('newgistics-client-token');

        newgisticsClient.getToken(function(err, token1) {
            assert.ifError(err);

            newgisticsClient.getToken(function(err, token2) {
                assert.ifError(err);

                assert.deepStrictEqual(token1, token2);

                done();
            });
        });
    });
});

describe.skip('NewgisticsClient.createPackage', function() {
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