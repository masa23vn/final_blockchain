const CryptoJS = require("crypto-js");
const ecdsa = require('elliptic');
const _ = require('lodash');

const ec = new ecdsa.ec('secp256k1');

const { validateLocation } = require('./Location');

class Transaction {
    constructor() {
        this.id;
        this.index;
        this.fromLocation;
        this.toLocation;
        this.signature
        this.isFinish;

        this.supplyID;
        this.itemID;
        this.name;
        this.description;
        this.price;
        this.amount;
    }
}

const getTransactionId = (transaction) => {
    return CryptoJS.SHA256(transaction.index + transaction.fromLocation.id + transaction.toLocation.id + transaction.supplyID +
        transaction.itemID + transaction.name + transaction.description + transaction.price + transaction.amount)
        .toString();
};

const validateTransaction = (transaction) => {
    if (!isValidTransactionStructure(transaction)) {
        console.log('Invalid structure tx');
        return false;
    }

    if (getTransactionId(transaction) !== transaction.id) {
        console.log('invalid tx id: ' + transaction.id);
        return false;
    }

    if (transaction.fromLocation) {
        if (!validateLocation(transaction.fromLocation)) {
            console.log('From location is wrong in tx: ' + transaction.id);
            return false;
        }

        // const foundLocation = locationPool.find(i => i.id === transaction.fromLocation.id);
        // if (!foundLocation) {
        //     console.log('From location not found in tx: ' + transaction.id);
        //     return false;
        // }
    }


    if (transaction.toLocation) {
        if (!validateLocation(transaction.toLocation)) {
            console.log('To location is wrong in tx: ' + transaction.id);
            return false;
        }

        // const foundLocation = locationPool.find(i => i.id === transaction.toLocation.id);
        // if (!foundLocation) {
        //     console.log('To location not found in tx: ' + transaction.id);
        //     return false;
        // }
    }

    try {
        const key = ec.keyFromPublic(transaction.fromLocation.address, 'hex');
        const validSignature = key.verify(transaction.id, transaction.signature);
        if (!validSignature) {
            console.log('invalid signature in tx; ', transaction.id);
            return false;
        }
    }
    catch (error) {
        console.log('invalid signature in tx; ', transaction.id);
        return false;
    }

    return true;
};

const validateBlockTransactions = (aTransactions) => {
    //check for duplicate
    if (hasDuplicates(aTransactions)) {
        return false;
    }

    return aTransactions.map((tx) => validateTransaction(tx))
        .reduce((a, b) => (a && b), true);

};

const hasDuplicates = (aTransactions) => {
    const groups = _.countBy(aTransactions, (tx) => tx.id); // perform callback to txId then count duplicate
    return _(groups)
        .map((value, key) => {
            if (value > 1) {
                console.log('duplicate tx: ' + key);
                return true;
            } else {
                return false;
            }
        })
        .includes(true);
};

const signTx = (transaction, privateKey) => {
    const dataToSign = transaction.id;
    const key = ec.keyFromPrivate(privateKey, 'hex');
    const signature = toHexString(key.sign(dataToSign).toDER());
    return signature;
};

const processTransactions = (aTransactions) => {
    if (!validateBlockTransactions(aTransactions)) {
        console.log('invalid block transactions');
        return false;
    }
    return true;
};

const toHexString = (byteArray) => {
    return Array.from(byteArray, (byte) => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
};

const getPublicKey = (aPrivateKey) => {
    return ec.keyFromPrivate(aPrivateKey, 'hex').getPublic().encode('hex');
};

//valid tyoe
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

const isValidTransactionStructure = (transaction) => {
    if (typeof transaction.id !== 'string') {
        console.log('invalid tx id');
        return false;
    } else if (typeof transaction.index !== 'number') {
        console.log('invalid tx index');
        return false;
    } else if (typeof transaction.supplyID !== 'string') {
        console.log('invalid tx supplyID');
        return false;
    } else if (typeof transaction.itemID !== 'string') {
        console.log('invalid tx itemID');
        return false;
    } else if (typeof transaction.name !== 'string') {
        console.log('invalid tx name');
        return false;
    } else if (typeof transaction.description !== 'string') {
        console.log('invalid tx description');
        return false;
    } else if (typeof transaction.price !== 'number') {
        console.log('invalid tx price');
        return false;
    } else if (typeof transaction.amount !== 'number') {
        console.log('invalid tx amount');
        return false;
    } else {
        return true;
    }
};

module.exports = {
    processTransactions, signTx, getTransactionId, isValidAddress,
    validateTransaction, getPublicKey, hasDuplicates,
    Transaction
};