const CryptoJS = require("crypto-js");
const ecdsa = require('elliptic');
const _ = require('lodash');

const ec = new ecdsa.ec('secp256k1');

const COINBASE_AMOUNT = 50;

// class Location
class Location {
    constructor() {
        this.id;
        this.index;
        this.name;
        this.location;
        this.address;
    }
}

const getLocationId = (location) => {
    return CryptoJS.SHA256(location.index + location.name + location.location).toString();
};


//valid type
const isValidAddress = (address) => {
    if (address.length !== 130) {
        console.log('invalid public key length');
        return false;
    } else if (address.match('^[a-fA-F0-9]+$') === null) {
        console.log('public key must contain only hex characters');
        return false;
    } else if (!address.startsWith('04')) {
        console.log('public key must start with 04');
        return false;
    }
    return true;
};

const isValidLocationStructure = (location) => {
    if (location == null) {
        console.log('location is null');
        return false;
    } else if (typeof location.id !== 'string') {
        console.log('invalid id type in location');
        return false;
    } else if (typeof location.name !== 'string') {
        console.log('invalid name type in location');
        return false;
    } else if (typeof location.location !== 'string') {
        console.log('invalid location type in location');
        return false;
    } else if (typeof location.index !== 'number') {
        console.log('invalid index type in location');
        return false;
    } else if (typeof location.address !== 'string') {
        console.log('invalid address type in location');
        return false;
    } else {
        return true;
    }
};

const validateLocation = (location) => {
    if (!isValidLocationStructure(location)) {
        return false;
    }

    if (getLocationId(location) !== location.id) {
        console.log('invalid location id: ' + location.id);
        return false;
    }

    if (!isValidAddress(location.address)) {
        console.log('invalid location address: ' + location.id);
        return false;
    }

    return true;
};

const hasDuplicates = (location) => {
    const groups = _.countBy(location, (l) => l.index + l.name + l.location); // perform callback to txIns then count duplicate
    return _(groups)
        .map((value, key) => {
            if (value > 1) {
                console.log('duplicate location: ' + key);
                return true;
            } else {
                return false;
            }
        })
        .includes(true);
};

const validateLocationPool = (aLocations) => {
    //check for duplicate location. Each location can be included only once
    if (hasDuplicates(aLocations)) {
        return false;
    }

    // check all
    return aLocations.map((location) => validateLocation(location))
        .reduce((a, b) => (a && b), true);
};

const findLocation = (locationPool, locationId) => {
    return locationPool.find((l) => locationId === l.id);
};

const findCurrentLocation = (locationPool, address) => {
    return locationPool.find((l) => address === l.address);
};

const createLocation = (index, name, location, address) => {
    let temp = new Location();
    temp.index = index;
    temp.name = name;
    temp.location = location;
    temp.address = address;
    temp.id = getLocationId(temp);

    return temp;
};


module.exports = {
    getLocationId, isValidAddress, validateLocation, validateLocationPool,
    findLocation,
    createLocation, findCurrentLocation,
    Location
};