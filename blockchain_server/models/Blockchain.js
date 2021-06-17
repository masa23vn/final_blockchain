const CryptoJS = require("crypto-js");
const _ = require('lodash');
const hexToBinary = require('hex-to-binary');
const { saveToFile } = require('./File')
const { Transaction, processTransactions, validateTransaction, isValidAddress, getPublicKey } = require('./transaction');
const { createTransaction, getPrivateFromWallet, getPublicFromWallet, generatePrivateKey, generatePublicKey } = require('./wallet');
const { addToTransactionPool, getTransactionPool, updateTransactionPool } = require('./transactionPool');
const { createLocation, findCurrentLocation, validateLocationPool } = require('./Location');

class Block {
    constructor(index, hash, previousHash, timestamp, data, location) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.location = location;
        this.hash = hash;
    }
}

const genesisBlock = new Block(
    0, '5efade649896b73d85423254a8a645dd81a97304b15c9e791ec5ef2c4b6b2f60', '', 1465154705, [], []
);

let blockchain = [genesisBlock];

// get function
const getBlockchain = () => blockchain;

const getLatestBlock = () => blockchain[blockchain.length - 1];

const getLatestLocation = () => getLatestBlock().location;

const getCurrentTimestamp = () => new Date().getTime();

// create block function
const generateRawNextBlock = (blockData) => {
    const previousBlock = getLatestBlock();
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = getCurrentTimestamp();

    const newBlock = mineBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, previousBlock.location);
    if (addBlock(newBlock)) {
        const { broadcastLatest } = require('../socket/p2p')
        broadcastLatest();
        saveToFile(blockchain, 'keys/chain.json')
        return newBlock;
    } else {
        return null;
    }
};

const generateRawNextBlockLocation = (location) => {
    const previousBlock = getLatestBlock();
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = getCurrentTimestamp();
    let newLocationList = previousBlock.location.concat(location);

    const newBlock = mineBlock(nextIndex, previousBlock.hash, nextTimestamp, [], newLocationList);
    if (addBlock(newBlock)) {
        const { broadcastLatest } = require('../socket/p2p')
        broadcastLatest();
        saveToFile(blockchain, 'keys/chain.json')
        return newBlock;
    } else {
        return null;
    }
};

const generateNextBlockWithLocation = (name, location) => {
    const list = getLatestLocation();
    const index = list.length > 0 ? list[list.length - 1].index + 1 : 0;
    const privateKey = generatePrivateKey();
    const address = generatePublicKey(privateKey)
    const newLocation = createLocation(index, name, location, address);

    const newBlock = generateRawNextBlockLocation(newLocation);
    return { newBlock, privateKey }
};

const generatenextBlockWithSupply = (supplyID) => {
    const pools = getTransactionPool();
    const blockData = pools.filter(i => i.supplyID === supplyID);
    if (blockData.length === 0) {
        throw Error("Supply not found");
    }
    return generateRawNextBlock(blockData);
};

const sendTransaction = (index, from, to, isFinish, supplyID, itemID, name, description, price, amount) => {
    const tx = createTransaction(index, getPrivateFromWallet(), from, to, isFinish, supplyID, itemID, name, description, price, amount);
    addToTransactionPool(tx);
    const { broadCastTransactionPool } = require('../socket/p2p')
    broadCastTransactionPool();
    return tx;
};

const sendTransactionGuess = (tx) => {
    addToTransactionPool(tx);
    const { broadCastTransactionPool } = require('../socket/p2p')
    broadCastTransactionPool();
    return tx;
};

const calculateHashForBlock = (block) =>
    calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.location);

const calculateHash = (index, previousHash, timestamp, data, location) =>
    CryptoJS.SHA256(index + previousHash + timestamp + data + location).toString();

const addBlock = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        const retVal = processTransactions(newBlock.data);
        const checkLocation = validateLocationPool(newBlock.location)
        if (!retVal) {
            console.log('block is not valid in terms of transactions');
            return false;
        }
        if (!checkLocation) {
            console.log('block is not valid in terms of location');
            return false;
        }

        blockchain.push(newBlock);
        updateTransactionPool(blockchain);
        return true;

    }
};

// check valid function
const isValidTimestamp = (newBlock, previousBlock) => {
    return (previousBlock.timestamp - 60 < newBlock.timestamp)
        && newBlock.timestamp - 60 < getCurrentTimestamp();
};

const isValidBlockStructure = (block) => {
    if (block == null) {
        console.log('block is null');
        return false;
    } else if (typeof block.index !== 'number') {
        console.log('invalid block index type');
        return false;
    } else if (typeof block.hash !== 'string') {
        console.log('invalid block hash type');
        return false;
    } else if (typeof block.previousHash !== 'string') {
        console.log('invalid block previousHash type');
        return false;
    } else if (typeof block.timestamp !== 'number') {
        console.log('invalid block timestamp type');
        return false;
    }
    return true;
};

const isValidNewBlock = (newBlock, previousBlock) => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('invalid block structure: %s', JSON.stringify(newBlock));
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    }
    else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    }
    else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('invalid timestamp');
        return false;
    }
    else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log('invalid hash, got:' + newBlock.hash);
        return false;
    }

    return true;
};

const isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(genesisBlock)) {
        return null;
    }

    for (let i = 1; i < blockchainToValidate.length; i++) {
        if (!isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return null;
        }

        const currentBlock = blockchainToValidate[i];
        const isValid = processTransactions(currentBlock.data);
        const checkLocation = validateLocationPool(currentBlock.location)
        if (!isValid) {
            console.log('invalid transactions when replace blockchain');
            return false;
        }
        if (!checkLocation) {
            console.log('invalid location when replace blockchain');
            return false;
        }
    }

    return true;
};

// edit blockchain function 

const replaceChain = (newBlocks) => {
    const isValid = isValidChain(newBlocks);
    if (isValid && newBlocks.length > getBlockchain().length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        updateTransactionPool(newBlocks);
        const { broadcastLatest } = require('../socket/p2p')
        broadcastLatest();

        saveToFile(blockchain, 'keys/chain.json')
    } else {
        console.log('Received blockchain invalid');
    }
};

const mineBlock = (index, previousHash, timestamp, data, location) => {
    const hash = calculateHash(index, previousHash, timestamp, data, location);
    return new Block(index, hash, previousHash, timestamp, data, location);
};

const handleReceivedTransaction = (transaction) => {
    addToTransactionPool(transaction);
};

// find
const findLatestItemBlock = (supplyID) => {
    const txs = _(getBlockchain())
        .map((block) => block.data)
        .flatten()              // remove 1 outer array
        .value();

    const itemTx = txs.slice().reverse().find(tx => {
        return tx.supplyID === supplyID;
    })
    return itemTx;
};

const findLatestItemPool = (supplyID) => {
    const txs = getTransactionPool();

    const itemTx = txs.slice().reverse().find(tx => {
        return tx.supplyID === supplyID;
    })
    return itemTx;
};

const findItemBlock = (supplyID) => {
    const txs = _(getBlockchain())
        .map((block) => block.data)
        .flatten()              // remove 1 outer array
        .value();

    const itemTx = txs.filter(tx => {
        return tx.supplyID === supplyID;
    })
    return itemTx;
};

const findItemPool = (supplyID) => {
    const txs = getTransactionPool();

    const itemTx = txs.filter(tx => {
        return tx.supplyID === supplyID;
    })
    return itemTx;
};

const getAllSupplies = () => {
    const txs = _(getBlockchain())
        .map((blocks) => blocks.data)
        .flatten()
        .value();

    const uniqueSupply = [...new Set(txs.map(tx => tx.supplyID))]
    const res = uniqueSupply.map(sp => {
        const tx = txs.find(tx => tx.supplyID === sp)

        const item = {
            supplyID: tx.supplyID,
            itemID: tx.itemID,
            name: tx.name,
            description: tx.description,
            price: tx.price,
        }

        return item
    })
    return res;
};

const getAllSuppliesByLocation = () => {
    const location = findCurrentLocation(getLatestLocation(), getPublicFromWallet());
    const txs = _(getBlockchain())
        .map((blocks) => blocks.data)
        .flatten()
        .value();
    if (!location) {
        throw Error("Can't not find your location")
    }

    const uniqueSupply = [...new Set(txs.map(tx => tx.supplyID))]
    const list = uniqueSupply.map(sp => {
        let tx = txs.filter(tx => tx.supplyID === sp);
        const unconfirm = findItemPool(tx[0].supplyID);
        if (unconfirm.length > 0) {
            tx = tx.concat(unconfirm)
        }
        return { data: tx, hasUnConfirm: unconfirm.length > 0 };
    })
    const res = list.filter(i => {
        const supply = i.data;
        const isLocation = supply[supply.length - 1].toLocation.id === location.id;
        const isFinish = supply[supply.length - 1].isFinish === true || supply[supply.length - 1].isFinish === 'true';
        return isLocation && (!isFinish || i.hasUnConfirm);
    })
    return res;
};

module.exports = {
    Block,
    getBlockchain,
    getLatestBlock,
    getLatestLocation,
    generateRawNextBlock,
    isValidBlockStructure, calculateHashForBlock,
    replaceChain,
    addBlock,
    sendTransaction,
    handleReceivedTransaction,
    sendTransactionGuess,
    findLatestItemBlock,
    findLatestItemPool,
    findItemBlock,
    findItemPool,
    getAllSupplies,
    getAllSuppliesByLocation,
    generatenextBlockWithSupply,
    generateNextBlockWithLocation,
};