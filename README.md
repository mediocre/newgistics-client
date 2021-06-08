# newgistics-client

[![Build Status](https://travis-ci.org/mediocre/newgistics-client.svg?branch=main)](https://travis-ci.org/mediocre/newgistics-client)
[![Coverage Status](https://coveralls.io/repos/github/mediocre/newgistics-client/badge.svg?branch=main)](https://coveralls.io/github/mediocre/newgistics-client?branch=main)

A client library for the Newgistics Shipping API that supports generation of Newgistics compliant delivery labels.

## Requirements

Newgistics customers must obtain an API client_id and client_secret for the sandbox test environment from Newgistics before integrating. Production client_id and client_secret must be obtained before promotion to the production environment.

## Installation

    npm install newgistics-client --save

## Usage

```javascript
const NewgisticsClient = require('newgistics-client');

var newgisticsClient = new NewgisticsClient({
    client_id: 'your_client_id',
    client_secret: 'your_client_secret'
});
```

### newgisticsClient.closeout(merchantId, [ngsFacilityIds,] callback)

Creates a manifest file for all valid labels generated since previous closeout.
The ngsFacilityIds parameter is optional. If omitted all packages for all facilities will be manifested. If present only packages for the given facilities will be manifested. 

**Example**

```javascript
newgisticsClient.closeout('1234', function(err) {
});
```

```javascript
newgisticsClient.closeout('1234', ['5678', '0000'], function(err) {
});
```

### newgisticsClient.createPackage(package, callback)

Create a package and obtain a label. Returns ZPL format or URL for label image.

**Example**

```javascript
var packageRequest = {
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

newgisticsClient.createPackage(packageRequest, function(err, packageResponse) {
    console.log(packageResponse);
});
```

### newgisticsClient.getToken()

Obtain a JWT Bearer Token for use in calls to other Newgistics Services.

**Example**

```javascript
newgisticsClient.getToken(function(err, token) {
    console.log(token);
});
```

### newgisticsClient.ping()

The Newgistics Shipping API is designed to be low latency and scalable. It offers between 100 and 200 millisecond response times in the continental US. You can validate response times by using the ping method.

**Example**

```javascript
newgisticsClient.ping(function(err, pong) {
    console.log(pong);
});
```

### newgisticsClient.reprintPackage(packageId, callback)

Reprint a label previously created by package ID.

**Example**

```javascript
newgisticsClient.reprintPackage('packageId', function(err, package) {
    console.log(package);
});
```

### newgisticsClient.reprintTracking(trackingNumber, callback)

Reprint a label previously created by tracking number.

**Example**

```javascript
newgisticsClient.reprintTracking('trackingNumber', function(err, package) {
    console.log(package);
});
```

### newgisticsClient.voidPackage(packageId, callback)

Void label previously created by package ID.

**Example**

```javascript
newgisticsClient.voidPackage('packageId', function(err) {
    console.log(err);
});
```

### newgisticsClient.voidTracking(trackingNumber, callback)

Void label previously created by tracking number.

**Example**

```javascript
newgisticsClient.voidTracking('trackingNumber', function(err) {
    console.log(err);
});
```