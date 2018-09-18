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
            secret: 'a_secret' });

        assert.strictEqual('some_api_url', client.opts.api_url);
        assert.strictEqual('some_auth_url', client.opts.auth_url);
        assert.strictEqual('9999', client.opts.clientFacilityId);
        assert.strictEqual('0000', client.opts.facilityId);
        assert.strictEqual('an_id', client.opts.id);
        assert.strictEqual('a_secret', client.opts.secret);
    });
});
