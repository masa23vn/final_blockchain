const CryptoJS = require("crypto-js");
const ecdsa = require('elliptic');
const _ = require('lodash');
const { saveToFile } = require('./File')

const ec = new ecdsa.ec('secp256k1');

const COINBASE_AMOUNT = 50;

global.locationPool = [];

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

// LocationPool
const getLocationPool = () => {
    return _.cloneDeep(locationPool);
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

const setLocationPool = (aLocations) => {
    if (validateLocationPool(aLocations)) {
        locationPool = _.cloneDeep(aLocations);
        const { saveToFile } = require('./File')
        saveToFile(locationPool, 'keys/location.json')
    }
}

const addToLocationPool = (location) => {
    if (!validateLocation(location)) {
        throw Error('Trying to add invalid location to pool');
    }

    for (let i = 0; i < locationPool.length; i++) {
        let l = locationPool[i];
        if (l.index + l.name + l.location === location.index + location.name + location.location) {
            throw Error('Trying to add duplicate location to pool');
        }
    }

    locationPool.push(location);
    saveToFile(locationPool, 'keys/location.json')
};

const findLocation = (locationId) => {
    return locationPool.find((l) => locationId === l.id);
};

const createLocation = (name, location, address) => {
    const pool = getLocationPool();

    let temp = new Location();
    temp.index = pool[pool.length - 1] ? pool[pool.length - 1].index + 1 : 0;
    temp.name = name;
    temp.location = location;
    temp.address = address;
    temp.id = getLocationId(temp);

    return temp;
};


module.exports = {
    getLocationId, isValidAddress, validateLocation, 
    getLocationPool, setLocationPool, addToLocationPool, findLocation,
    createLocation,
    Location
};