const assert = require('assert');
const NewgisticsClient = require('../client');

describe('Arguments', function() {
    it('Incoming args should be overlaid on opts', function() {
        var client = new NewgisticsClient({
            api_url: 'some_api_url',
            auth_url: 'some_auth_url',
            clientFacilityId: '9999',
            facilityId: '0000',
            id: 'an_id',
            returnAddress: {
                city: 'Somewhereville',
                country: 'US',
                isResidential: false,
                line1: '1 Nowhere Lane',
                line2: 'Suite 0',
                name: 'A Mediocre Corporation',
                postalCode: '01234',
                state: 'TX'
            },
            secret: 'a_secret'
        });

        assert.strictEqual('some_api_url', client.opts.api_url);
        assert.strictEqual('some_auth_url', client.opts.auth_url);
        assert.strictEqual('9999', client.opts.clientFacilityId);
        assert.strictEqual('0000', client.opts.facilityId);
        assert.strictEqual('an_id', client.opts.id);
        assert.strictEqual('a_secret', client.opts.secret);

        assert.strictEqual('Somewhereville', client.opts.returnAddress.city);
        assert.strictEqual('US', client.opts.returnAddress.country);
        assert.strictEqual(false, client.opts.returnAddress.isResidential);
        assert.strictEqual('1 Nowhere Lane', client.opts.returnAddress.line1);
        assert.strictEqual('Suite 0', client.opts.returnAddress.line2);
        assert.strictEqual('A Mediocre Corporation', client.opts.returnAddress.name);
        assert.strictEqual('01234', client.opts.returnAddress.postalCode);
        assert.strictEqual('TX', client.opts.returnAddress.state);
    });
});

describe('Functionality', function() {
    it.skip('Should authenticate with generic sandbox keys and return a shipment descriptor', function(done) {
        var client = new NewgisticsClient({
            api_url: 'https://shippingapi.sandbox.ncommerce.com/v1/packages',
            auth_url: 'https://authapi.sandbox.ncommerce.com/connect/token',
            clientFacilityId: '9999',
            facilityId: '1111',
            id: 'DEADBEEF-1CAT-2CAT-3CAT-1EE7DEADBEEF',
            returnAddress: {
                name: 'A Mediocre Corporation',
                line1: '1 Meh Lane',
                line2: 'Suite 0',
                city: 'Carrollton',
                state: 'TX',
                postalCode: '75010',
                isResidential: false
            },
            secret: 'DEADBEEF-4CAT-5CAT-6CAT-1EE7DEADBEEF'
        });

        var address = {
            city: 'Dallas',
            line1: '5531 Willis Ave',
            name: 'Joe User',
            postalCode: '75206',
            state: 'TX'
        };
        client.createShipment(address, 12, 8, 4, 0.5, function(err, shipmentResponse) {
            assert.ifError(err);
            console.log(JSON.stringify(shipmentResponse));

            assert(true);
            done();
        });
    });
});
