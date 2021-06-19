const CryptoJS = require("crypto-js");
const { ec } = require('elliptic');
const _ = require('lodash');
const { existsSync, readFileSync, unlinkSync, writeFileSync } = require('fs');
const { getPublicKey, getTransactionId, signTx, Transaction } = require('./transaction');

const EC = new ec('secp256k1');
const privateKeyLocation = 'keys/private_key';

const getPrivateFromWallet = () => {
    const encrypted = readFileSync(privateKeyLocation, 'utf8');
    return encrypted;
};

const getPublicFromWallet = () => {
    const privateKey = getPrivateFromWallet();
    const key = EC.keyFromPrivate(privateKey, 'hex');
    return key.getPublic().encode('hex');
};

const generatePrivateKey = () => {
    const keyPair = EC.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
};

const generatePublicKey = (privateKey) => {
    const key = EC.keyFromPrivate(privateKey, 'hex');
    return key.getPublic().encode('hex');
};

const initWallet = () => {
    // let's not override existing private keys
    if (!existsSync(privateKeyLocation)) {
        const newPrivateKey = generatePrivateKey();
        writeFileSync(privateKeyLocation, newPrivateKey);
        console.log('new wallet with private key created');
    }
};

const deleteWallet = () => {
    if (existsSync(privateKeyLocation)) {
        unlinkSync(privateKeyLocation);
    }
};

const createTransaction = (index, privateKey, from, to, isFinish, supplyID, itemID,
    name, description, price, amount) => {

    const myAddress = getPublicKey(privateKey);
    // filter from unspentOutputs such inputs that are referenced in pool

    const tx = new Transaction();
    tx.index = index;
    tx.fromLocation = from;
    tx.toLocation = to;
    tx.isFinish = isFinish;
    tx.supplyID = supplyID;
    tx.itemID = itemID;
    tx.name = name;
    tx.description = description;
    tx.price = price;
    tx.amount = amount;
    tx.id = getTransactionId(tx);
    tx.signature = signTx(tx, privateKey);

    return tx;
};

module.exports = {
    createTransaction,
    getPublicFromWallet,
    getPrivateFromWallet,
    generatePrivateKey,
    initWallet,
    deleteWallet,
    generatePrivateKey,
    generatePublicKey,
};