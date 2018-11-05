const assert = require('assert');

const cache = require('memory-cache');

const NewgisticsClient = require('../client');

var trackingNumber;

describe('NewgisticsClient.createPackage', function() {
    this.timeout(5000);

    it('should return an error', function(done) {
        // Clear existing token
        cache.del('newgistics-client-token');

        var newgisticsClient = new NewgisticsClient({
            client_id: 'invalid'
        });

        newgisticsClient.createPackage({}, function(err, package) {
            assert(err);

            assert.strictEqual(err.message, 'invalid_client');
            assert.strictEqual(package, undefined);

            done();
        });
    });

    it('should return an error', function(done) {
        var newgisticsClient = new NewgisticsClient({
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: 'invalid'
        });

        newgisticsClient.createPackage({}, function(err, package) {
            assert(err);

            assert.strictEqual(package, undefined);

            done();
        });
    });

    it('should return an error', function(done) {
        var newgisticsClient = new NewgisticsClient({
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET
        });

        newgisticsClient.createPackage({}, function(err, package) {
            assert(err);

            assert.strictEqual(package, undefined);

            done();
        });
    });

    it('should create a package', function(done) {
        var newgisticsClient = new NewgisticsClient({
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET
        });

        var package = {
            classOfService: 'Ground',
            clientFacilityId: '8448',
            dimensions: {
                height: {
                    measurementValue: '1',
                    unitOfMeasure: 'Inches'
                },
                isRectangular: true,
                length: {
                    measurementValue: '6',
                    unitOfMeasure: 'Inches'
                },
                width: {
                    measurementValue: '4',
                    unitOfMeasure: 'Inches'
                }
            },
            ngsFacilityId: '1361',
            pricePackage: true,
            returnAddress: {
                address1: '4717 Plano Parkway',
                address2: 'Suite 130',
                city: 'Carrollton',
                country: 'US',
                isResidential: false,
                name: 'A Mediocre Corporation',
                postalCode: '75010',
                stateOrProvince: 'TX'
            },
            shipToAddress: {
                address1: '5531 Willis Ave',
                city: 'Dallas',
                country: 'US',
                name: 'Joe User',
                postalCode: '75206',
                stateOrProvince: 'TX'
            },
            weight: {
                measurementValue: '0.5',
                unitOfMeasure: 'Pounds'
            }
        };

        newgisticsClient.createPackage(package, function(err, package) {
            assert.ifError(err);

            assert(package.packageId);
            assert(package.trackingId);
            assert(package.labels[0].labelData);
            assert(package.pricingInformation);

            trackingNumber = package.trackingId;

            done();
        });
    });
});

describe('NewgisticsClient.getToken', function() {
    this.timeout(5000);

    it('should return an error', function(done) {
        // Clear existing token
        cache.del('newgistics-client-token');

        var newgisticsClient = new NewgisticsClient({
            authapi_url: 'invalid'
        });

        newgisticsClient.getToken(function(err, token) {
            assert(err);

            assert.strictEqual(token, undefined);

            done();
        });
    });

    it('should return an invalid_client error', function(done) {
        // Clear existing token
        cache.del('newgistics-client-token');

        var newgisticsClient = new NewgisticsClient({
            client_id: 'invalid'
        });

        newgisticsClient.getToken(function(err, token) {
            assert(err);

            assert.strictEqual(err.message, 'invalid_client');
            assert.strictEqual(token, undefined);

            done();
        });
    });

    it('should return a valid token', function(done) {
        var newgisticsClient = new NewgisticsClient({
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET
        });

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
        var newgisticsClient = new NewgisticsClient({
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET
        });

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

describe('NewgisticsClient.ping', function() {
    this.timeout(5000);

    it('should return an error', function(done) {
        var newgisticsClient = new NewgisticsClient({
            shippingapi_url: 'invalid'
        });

        newgisticsClient.ping(function(err, pong) {
            assert(err);

            assert.strictEqual(pong, undefined);

            done();
        });
    });

    it('should return a pong', function(done) {
        var newgisticsClient = new NewgisticsClient({
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET
        });

        newgisticsClient.ping(function(err, pong) {
            assert.ifError(err);

            assert(pong);

            done();
        });
    });
});

describe('NewgisticsClient.voidTracking', function() {
    this.timeout(5000);

    it('should return an error', function(done) {
        var newgisticsClient = new NewgisticsClient({
            shippingapi_url: 'invalid'
        });

        newgisticsClient.voidTracking('invalid', function(err) {
            assert(err);

            done();
        });
    });

    it('should return an error', function(done) {
        var newgisticsClient = new NewgisticsClient({
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET
        });

        newgisticsClient.voidTracking('\n', function(err) {
            assert(err);

            done();
        });
    });

    it('should not return an error for an invalid tracking number', function(done) {
        var newgisticsClient = new NewgisticsClient({
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET
        });

        newgisticsClient.voidTracking('invalid', function(err) {
            assert.ifError(err);

            done();
        });
    });

    it('should void tracking', function(done) {
        var newgisticsClient = new NewgisticsClient({
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET
        });

        newgisticsClient.voidTracking(trackingNumber, function(err) {
            assert.ifError(err);

            done();
        });
    });
});