const express = require("express");
const cors = require("cors");
require('console-stamp')(console, '[HH:MM:ss.l]');
require('dotenv').config()
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
const URL = process.env.API || "http://localhost:3000";
app.use(cors({
  origin: URL
}));

const { saveToFile, readFromFile } = require('./models/File');
const { getLocationId, isValidAddress, validateLocation, createLocation,
  getLocationPool, setLocationPool, addToLocationPool, findLocation } = require('./models/location');

const { getTransactionPool, setPool } = require('./models/transactionPool');

const { getPublicFromWallet, initWallet } = require('./models/wallet');
const { generateNextBlock, getBlockchain, generatenextBlockWithSupply, isValidBlockStructure, calculateHashForBlock,
  sendTransaction, replaceChain, sendTransactionGuess, generateNextBlockGuess, findLatestItemBlock, findLatestItemPool,
  findItemBlock, findItemPool, getAllSupplies, getAllSuppliesByLocation,
  Block
} = require('./models/Blockchain');
const { connectToPeers, getSockets, initP2PServer } = require('./socket/p2p');


const httpPort = parseInt(process.env.HTTP_PORT) || 9000;
const p2pPort = parseInt(process.env.P2P_PORT) || 8000;

initWallet();

// read blockchain and pool file
const blockchainLocation = 'keys/chain.json';
const poolLocation = 'keys/tx.json';
const locateLocation = 'keys/location.json';

if (fs.existsSync(locateLocation)) {
  const data = readFromFile(locateLocation)
  if (data && data.length > 1) {
    setLocationPool(data)
  }
  else {
    saveToFile(getLocationPool(), locateLocation)
  }
}
else {
  saveToFile(getLocationPool(), locateLocation)
}

if (fs.existsSync(blockchainLocation)) {
  const data = readFromFile(blockchainLocation)
  if (data && data.length > 1) {
    replaceChain(data)
  }
  else {
    saveToFile(getBlockchain(), blockchainLocation)
  }
}
else {
  saveToFile(getBlockchain(), blockchainLocation)
}

if (fs.existsSync(poolLocation)) {
  const data = readFromFile(poolLocation)
  if (data) {
    setPool(data)
  }
  else {
    saveToFile([], poolLocation)
  }
}
else {
  saveToFile([], poolLocation)
}

// route
app.get('/blocks', (req, res) => {
  res.send(getBlockchain());
});

app.get('/address', (req, res) => {
  const address = getPublicFromWallet();
  res.send({ 'address': address });
});

app.get('/pool', (req, res) => {
  res.send(getTransactionPool());
});

app.get('/location', (req, res) => {
  res.send(getLocationPool());
});

app.get('/block/:id', (req, res) => {
  const block = _.find(getBlockchain(), { 'index': Number(req.params.id) });
  if (block) {
    res.send(block);
  }
  else {
    res.status(400).send('could not find block');
  }
});

app.get('/transaction', (req, res) => {
  const tx = _(getBlockchain())
    .map((blocks) => blocks.data)
    .flatten()
    .value();
  res.send(tx);
});

app.get('/transaction/:id', (req, res) => {
  const tx = _(getBlockchain())
    .map((blocks) => blocks.data)
    .flatten()
    .find({ 'id': req.params.id });
  res.send(tx);
});

app.get('/supply', (req, res) => {
  try {
    const tx = getAllSupplies();
    res.send(tx);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

app.get('/supply/:id', (req, res) => {
  try {
    const supplies = _(getBlockchain())
      .map((blocks) => blocks.data)
      .flatten()
      .value();

    const supply = supplies.filter(i => i.supplyID === req.params.id);
    res.send(supply);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

app.get('/supplyByLocation', (req, res) => {
  try {
    const supplies = getAllSuppliesByLocation()
    res.send(supplies);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

app.get('/peers', (req, res) => {
  res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
});

app.post('/mineBlockWithSupply', (req, res) => {                 //  all transaction pool
  try {
    const { supplyID } = req.body;
    const newBlock = generatenextBlockWithSupply(supplyID);
    if (newBlock === null) {
      res.status(400).send('could not generate block');
    } else {
      res.send(newBlock);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }

});

// TODO
app.post('/sendTransaction', (req, res) => {
  try {
    const { locationId, isFinish, itemID, name, description, price, amount } = req.body;

    const location = findLocation(locationId);
    const supplyID = uuidv4();
    const finish = parseInt(isFinish) ? true : false;

    const resp = sendTransaction(0, location, location, finish, supplyID, itemID, name, description, parseInt(price), parseInt(amount));

    res.send(resp);
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }
});

app.post('/sendTransactionContinue', (req, res) => {
  try {
    const { toId, isFinish, supplyID, amount } = req.body;

    const toLocation = findLocation(toId)
    const lastTx = findLatestItemBlock(supplyID);
    const lastWaitTx = findLatestItemPool(supplyID);
    if (lastWaitTx) {
      return res.status(400).send("Found unconfirmed transacions of this item");
    }
    if (!lastTx) {
      return res.status(400).send("Supply not found. Please create new.");
    }
    if (!toLocation) {
      return res.status(400).send("Location not found. Please try again.");
    }
    const finish = parseInt(isFinish) ? true : false

    const resp = sendTransaction(lastTx.index + 1, lastTx.toLocation, toLocation, finish, lastTx.supplyID,
      lastTx.itemID, lastTx.name, lastTx.description, lastTx.price, parseInt(amount));

    res.send(resp);
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }
});

app.post('/addLocation', (req, res) => {
  try {
    const { name, location, address } = req.body;

    const temp = createLocation(name, location, address);
    const resp = addToLocationPool(temp);

    res.send(200);
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }
});

app.post('/addPeer', (req, res) => {
  try {
    connectToPeers(req.body.peer);
    res.send(200);
  } catch (e) {
    res.status(400).send(e.message)
  }
});

app.post('/stop', (req, res) => {
  res.send({ 'msg': 'stopping server' });
  process.exit();
});

// catch 404 and forward to error handler
app.use(function (err, req, res, next) {
  console.log(err)
});


app.listen(httpPort, () => {
  console.log('Listening http on port: ' + httpPort);
});

// websocket for other server
initP2PServer(p2pPort);

