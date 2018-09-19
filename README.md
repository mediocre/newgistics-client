# newgistics-client

[![Build Status](https://travis-ci.org/mediocre/newgistics-client.svg?branch=master)](https://travis-ci.org/mediocre/newgistics-client)
[![Coverage Status](https://coveralls.io/repos/github/mediocre/newgistics-client/badge.svg?branch=master)](https://coveralls.io/github/mediocre/newgistics-client?branch=master)

A client wrapper to create packages with the Newgistics API.

## Requirements

You will need your own client ID, client secret, NGSFacilityId and ClientFacilityId provided by Newgistics. To successfully run tests, those values must be available through `process.env` at test time.

## Installation

    npm install newgistics-client --save

## Usage

```javascript
const NewgisticsClient = require('newgistics-client');

// instantiate with your credentials
var newgisticsClient = new NewgisticsClient({
    client_id: 'your_id',
    client_secret: 'your_secret',
    clientFacilityId: '9999',
    facilityId: '0000'
});

// describe your package
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
        city: 'Texasville',
        stateOrProvince: 'TX',
        postalCode: '01010',
        isResidential: false
    },
    shipToAddress: {
        city: 'Washingtonian',
        address1: '10101 Binary Way',
        name: 'Glenn Irk',
        postalCode: '10101',
        stateOrProvince: 'WA'
    },
    weight: {
        unitOfMeasure: 'Pounds',
        measurementValue: '0.5'
    }
};

// ship things!
newgisticsClient.createPackage(package, function(err, packageResponse) {
    // see "Example response" below
};
```

## Authentication

The `getToken()` method is exposed if you need direct access to the bearer token for some reason. Explicit calls to `getToken()` are not required; the `createPackage()` method calls it internally. The returned bearer token is cached in-memory based on the TTL/Expiry information returned from Newgistics to avoid needless calls to the OAuth endpoint.

## Example response
```json
{
    "packageId": "redacted",
    "trackingId": "even_more_redacted",
    "labels": [
        {
            "labelType": "ShippingLabel",
            "labelData": "redacted"
        }
    ],
    "classOfService": "Ground",
    "referenceNumbers": [],
    "ngsFacilityId": "9999",
    "carrier": "redacted",
    "carrierClassOfService": "redacted",
    "hazmatClasses": [],
    "subscription": null,
    "addressVerification": {
        "address": {
            "name": "Glenn Irk",
            "attention": null,
            "address1": "10101 Binary Way",
            "address2": "",
            "city": "Washingtonian",
            "stateOrProvince": "WA",
            "urbanization": "",
            "postalCode": "10101-0101",
            "country": "US",
            "isResidential": true
        },
        "status": "Verified",
        "summary": [
            "redacted"
        ]
    },
    "pricingInformation": {
        "ancillaryChargeAmt": 0,
        "basePrice": X.XX,
        "totalPrice": X.XX,
        "fees": [
            {
                "feeAmt": X.X,
                "feeType": "BaseFee"
            },
            {
                "feeAmt": X.XX,
                "feeType": "FuelSurcharge"
            }
        ],
        "billingWeight": X,
        "billingZone": X,
        "isAdjustment": false,
        "rateId": null,
        "rateResultCode": "Success",
        "errorMessage": null
    }
}
```