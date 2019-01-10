const assert = require('assert');

const cache = require('memory-cache');

const NewgisticsClient = require('../client');

describe('NewgisticsClient.closeout', function() {
    this.timeout(60000);

    it('should return an error', function(done) {
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: 'invalid'
        });

        newgisticsClient.closeout(1234, function(err) {
            assert(err);
            assert.strictEqual(err.message, 'Invalid URI "invalid/v1/closeout/1234"');

            done();
        });
    });

    it('should return an error for invalid client', function(done) {
        // Clear existing token
        cache.del('newgistics-client-token');

        const newgisticsClient = new NewgisticsClient({
            client_id: 'invalid'
        });

        newgisticsClient.closeout('1234', function(err) {
            assert(err);

            assert.strictEqual(err.message, 'invalid_client');

            done();
        });
    });

    it('should return an error for invalid merchant ID', function(done) {
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: process.env.NEWGISTICS_SHIPPINGAPI_URL
        });

        newgisticsClient.closeout('1234', function(err) {
            assert(err);

            assert.strictEqual(err.message, 'Merchant configuration not found');

            done();
        });
    });

    it('should return an error for non 200 status code', function(done) {
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: 'https://httpstat.us/500#'
        });

        newgisticsClient.closeout('1234', function(err) {
            assert(err);

            assert.strictEqual(err.message, '500 POST https://httpstat.us/500#/v1/closeout/1234 500 Internal Server Error');

            done();
        });
    });

    it('should closeout for a valid merchant ID', function(done) {
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: process.env.NEWGISTICS_SHIPPINGAPI_URL
        });

        newgisticsClient.closeout(process.env.NEWGISTICS_MERCHANT_ID, function(err) {
            assert.ifError(err);
            done();
        });
    });

    it('should closeout for a valid merchant ID and specified ngsFacilityIds', function(done) {
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: process.env.NEWGISTICS_SHIPPINGAPI_URL
        });

        newgisticsClient.closeout(process.env.NEWGISTICS_MERCHANT_ID, [process.env.NEWGISTICS_FACILITY_ID], function(err) {
            assert.ifError(err);
            done();
        });
    });
});

describe('NewgisticsClient.createPackage', function() {
    this.timeout(5000);

    it('should return an error', function(done) {
        // Clear existing token
        cache.del('newgistics-client-token');

        const newgisticsClient = new NewgisticsClient({
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
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
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
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: process.env.NEWGISTICS_SHIPPINGAPI_URL
        });

        newgisticsClient.createPackage({}, function(err, package) {
            assert(err);

            assert.strictEqual(package, undefined);

            done();
        });
    });

    it('should return an error for non 200 status code', function(done) {
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: 'https://httpstat.us/500#'
        });

        newgisticsClient.createPackage({}, function(err) {
            assert(err);

            assert.strictEqual(err.message, '500 POST https://httpstat.us/500#/v1/packages 500 Internal Server Error');

            done();
        });
    });

    it('should create a package', function(done) {
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: process.env.NEWGISTICS_SHIPPINGAPI_URL
        });

        const package = {
            classOfService: 'Ground',
            clientFacilityId: process.env.NEWGISTICS_CLIENT_FACILITY_ID,
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
            ngsFacilityId: process.env.NEWGISTICS_FACILITY_ID,
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

            done();
        });
    });
});

describe('NewgisticsClient.getToken', function() {
    this.timeout(5000);

    beforeEach(function() {
        // Clear existing token
        cache.del('newgistics-client-token');
    });

    it('should return an error for invalid authapi_url', function(done) {
        const newgisticsClient = new NewgisticsClient({
            authapi_url: 'invalid'
        });

        newgisticsClient.getToken(function(err, token) {
            assert(err);

            assert.strictEqual(token, undefined);

            done();
        });
    });

    it('should return an invalid_client error', function(done) {
        const newgisticsClient = new NewgisticsClient({
            client_id: 'invalid'
        });

        newgisticsClient.getToken(function(err, token) {
            assert(err);

            assert.strictEqual(err.message, 'invalid_client');
            assert.strictEqual(token, undefined);

            done();
        });
    });

    it('should return an error for non 200 status code', function(done) {
        const newgisticsClient = new NewgisticsClient({
            authapi_url: 'https://httpstat.us/500#',
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: process.env.NEWGISTICS_SHIPPINGAPI_URL
        });

        newgisticsClient.getToken(function(err) {
            assert(err);

            assert.strictEqual(err.message, '500 POST https://httpstat.us/500#/connect/token 500 Internal Server Error');

            done();
        });
    });

    it('should return a valid token', function(done) {
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: process.env.NEWGISTICS_SHIPPINGAPI_URL
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
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: process.env.NEWGISTICS_SHIPPINGAPI_URL
        });

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

    it('should return an error for invalid shippingapi_url', function(done) {
        const newgisticsClient = new NewgisticsClient({
            shippingapi_url: 'invalid'
        });

        newgisticsClient.ping(function(err, pong) {
            assert(err);

            assert.strictEqual(pong, undefined);

            done();
        });
    });

    it('should return an error for non 200 status code', function(done) {
        const newgisticsClient = new NewgisticsClient({
            authapi_url: process.env.NEWGISTICS_AUTHAPI_URL,
            client_id: process.env.NEWGISTICS_CLIENT_ID,
            client_secret: process.env.NEWGISTICS_CLIENT_SECRET,
            shippingapi_url: 'https://httpstat.us/500#'
        });

        newgisticsClient.ping(function(err) {
            assert(err);

            assert.strictEqual(err.message, '500 GET https://httpstat.us/500#/ping 500 Internal Server Error');

            done();
        });
    });

    it('should return a pong', function(done) {
        const newgisticsClient = new NewgisticsClient();

        newgisticsClient.ping(function(err, pong) {
            assert.ifError(err);

            assert(pong);

            done();
        });
    });
});