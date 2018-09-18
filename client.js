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

    return _this;
}

module.exports = NewgisticsClient;