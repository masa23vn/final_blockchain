const _ = require('lodash');
const { saveToFile } = require('./File')
const { Transaction, TxIn, UnspentTxOut, validateTransaction } = require('./transaction');
const fs = require('fs');

let transactionPool = [];

const getTransactionPool = () => {
    return _.cloneDeep(transactionPool);
};

const setPool = (pool) => {
    let temp = [];
    for (let i = 0; i < pool.length; i++) {
        if (!validateTransaction(pool[i])) {
            continue
        }
        temp.push(pool[i])
    }
    transactionPool = _.cloneDeep(temp);
}

const addToTransactionPool = (tx) => {
    if (!validateTransaction(tx)) {
        throw Error('Trying to add invalid tx to pool');
    }

    if (!isValidTxForPool(tx, transactionPool)) {
        throw Error('Trying to add duplicated tx to pool');
    }
    transactionPool.push(tx);
    saveToFile(transactionPool, 'keys/tx.json')
};

const getTxFromBlockchain = (blockchain) => {
    const txs = _(blockchain)
        .map((block) => block.data)
        .flatten()              // remove 1 outer array
        .value();

    return txs
}

const updateTransactionPool = (blockchain) => {
    const invalidTxs = [];
    const txBlock = getTxFromBlockchain(blockchain);
    for (const tx of transactionPool) {
        const txFound = txBlock.find(i => i.id === tx.id);
        if (txFound) {
            invalidTxs.push(tx);
        }
    }
    if (invalidTxs.length > 0) {
        transactionPool = _.without(transactionPool, ...invalidTxs);
        saveToFile(transactionPool, 'keys/tx.json')
    }
};

const isValidTxForPool = (tx, aTtransactionPool) => {
    for (const txPool of aTtransactionPool) {
        if (txPool.id === tx.id) {
            console.log('txIn already found in the txPool');
            return false;
        }
    }
    return true;
};

module.exports = { addToTransactionPool, getTransactionPool, updateTransactionPool, setPool };