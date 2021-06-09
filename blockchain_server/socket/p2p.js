const WebSocket = require('ws');
require('console-stamp')(console, '[HH:MM:ss.l]');
const { Server } = require('ws');
const { addBlock, Block, getBlockchain, getLatestBlock, replaceChain, isValidBlockStructure, handleReceivedTransaction } = require('../models/Blockchain');
const { getTransactionPool } = require('../models/transactionPool');
const { getLocationPool, addToLocationPool } = require('../models/location');

const sockets = [];

const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2,
    QUERY_TRANSACTION_POOL: 3,
    RESPONSE_TRANSACTION_POOL: 4,
    QUERY_LOCATION_POOL: 5,
    RESPONSE_LOCATION_POOL: 6,
}

const initP2PServer = (p2pPort) => {
    const server = new WebSocket.Server({ port: p2pPort });
    server.on('connection', (ws) => {
        initConnection(ws);
    });
    console.log('listening websocket p2p port on: ' + p2pPort);
};

const getSockets = () => sockets;

const initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
    // wait until connected
    setTimeout(() => {
        broadcast(queryTransactionPoolMsg());
        broadcast(queryLocationPoolMsg());
    }, 500);
};

const JSONToObject = (data) => {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log(e);
        return null;
    }
};

const initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        try {
            const message = JSONToObject(data);
            if (message === null) {
                console.log('could not parse received JSON message: ' + data);
                return;
            }
            console.log('Received message' + JSON.stringify(message));
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    write(ws, responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    write(ws, responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks = JSONToObject(message.data);
                    if (receivedBlocks === null) {
                        console.log('invalid blocks received:');
                        console.log(message.data)
                        break;
                    }
                    handleBlockchainResponse(receivedBlocks);
                    break;
                case MessageType.QUERY_TRANSACTION_POOL:
                    write(ws, responseTransactionPoolMsg());
                    break;
                case MessageType.RESPONSE_TRANSACTION_POOL:
                    const receivedTransactions = JSONToObject(message.data);
                    if (receivedTransactions === null) {
                        console.log('invalid transaction received: %s', JSON.stringify(message.data));
                        break;
                    }
                    receivedTransactions.forEach((transaction) => {
                        try {
                            handleReceivedTransaction(transaction);
                            // if no error is thrown, transaction was indeed added to the pool
                            // let's broadcast transaction pool
                            broadCastTransactionPool();
                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                    break;
                case MessageType.QUERY_LOCATION_POOL:
                    write(ws, responseLocationPoolMsg());
                    break;
                case MessageType.RESPONSE_LOCATION_POOL:
                    const receivedLocations = JSONToObject(message.data);
                    if (receivedLocations === null) {
                        console.log('invalid location received: %s', JSON.stringify(message.data));
                        break;
                    }
                    receivedLocations.forEach((location) => {
                        try {
                            addToLocationPool(location);
                            // if no error is thrown, location was indeed added to the pool
                            // let's broadcast location pool
                            broadCastLocationPool();
                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                    break;

            }
        } catch (e) {
            console.log(e);
        }
    });
};

const write = (ws, message) => ws.send(JSON.stringify(message));
const broadcast = (message) => sockets.forEach((socket) => write(socket, message));

const queryChainLengthMsg = () => ({ 'type': MessageType.QUERY_LATEST, 'data': null });

const queryAllMsg = () => ({ 'type': MessageType.QUERY_ALL, 'data': null });

const responseChainMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(getBlockchain())
});

const responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
});

const queryTransactionPoolMsg = () => ({
    'type': MessageType.QUERY_TRANSACTION_POOL,
    'data': null
});
const responseTransactionPoolMsg = () => ({
    'type': MessageType.RESPONSE_TRANSACTION_POOL,
    'data': JSON.stringify(getTransactionPool())
});

const queryLocationPoolMsg = () => ({
    'type': MessageType.QUERY_LOCATION_POOL,
    'data': null
});
const responseLocationPoolMsg = () => ({
    'type': MessageType.RESPONSE_LOCATION_POOL,
    'data': JSON.stringify(getLocationPool())
});

const initErrorHandler = (ws) => {
    const closeConnection = (myWs) => {
        console.log('connection failed to peer: ' + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

const handleBlockchainResponse = (receivedBlocks) => {
    if (receivedBlocks.length === 0) {
        console.log('received block chain size of 0');
        return;
    }
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    if (!isValidBlockStructure(latestBlockReceived)) {
        console.log('block structuture not valid');
        return;
    }
    const latestBlockHeld = getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: '
            + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            if (addBlock(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        } else if (receivedBlocks.length === 1) {
            console.log('We have to query the chain from our peer');
            broadcast(queryAllMsg());
        } else {
            console.log('Received blockchain is longer than current blockchain');
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
};

const broadcastLatest = () => {
    broadcast(responseLatestMsg());
};

const broadCastTransactionPool = () => {
    broadcast(responseTransactionPoolMsg());
};

const broadCastLocationPool = () => {
    broadcast(responseLocationPoolMsg());
};

const connectToPeers = (newPeer) => {
    try {
        const ws = new WebSocket(newPeer);
        ws.on('open', () => {
            initConnection(ws);
        });
        ws.on('error', () => {
            console.log('connection failed');
        });
    }
    catch (error) {
        console.log('Connection failed. Please check input URL');
        throw Error('Connection failed. Please check input URL');
    }

};

module.exports = { connectToPeers, broadcastLatest, initP2PServer, getSockets, broadCastTransactionPool };
