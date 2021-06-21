const express = require("express");
const cors = require("cors");
require('console-stamp')(console, '[HH:MM:ss.l]');
require('dotenv').config()
const fs = require('fs');
const CryptoJS = require("crypto-js");
const ecdsa = require('elliptic');
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
const { findLocation, findCurrentLocation } = require('./models/location');

const { getTransactionPool, setPool } = require('./models/transactionPool');

const { getPublicFromWallet, getPrivateFromWallet, initWallet } = require('./models/wallet');
const { getBlockchain, getLatestLocation, generatenextBlockWithSupply, generateNextBlockWithLocation,
  sendTransaction, replaceChain, findLatestItemBlock, findLatestItemPool,
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

//middleware
app.use('/connect', function (req, res, next) {
  console.log('Request Type:', req.method)

  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
    return res.status(401).send('Missing Authorization Header');
  }
  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // default password: 'password'
  const passwordLocation = 'keys/password';
  let savedPass = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; //default: 'password'
  if (fs.existsSync(passwordLocation)) {
    let temp = fs.readFileSync(passwordLocation, 'utf8');
    if (temp && temp !== '') {
      savedPass = temp;
    }
  }
  var newhHash = CryptoJS.SHA256(password).toString();
  if (newhHash !== savedPass) {
    return res.status(401).send("Wrong password");
  }
  next();
})

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
  res.send(getLatestLocation());
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

app.post('/connect/supplyByLocation', (req, res) => {
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


// Need authen
app.post('/connect/mineBlockWithSupply', (req, res) => {                 //  all transaction pool
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

app.post('/connect/sendTransaction', (req, res) => {
  try {
    const { locationId, isFinish, itemID, name, description, price, amount } = req.body;

    const fromLocation = findCurrentLocation(getLatestLocation(), getPublicFromWallet());
    const toLocation = findLocation(getLatestLocation(), locationId);
    const supplyID = uuidv4();
    const finish = parseInt(isFinish) ? true : false;

    if (!fromLocation) {
      return res.status(400).send("Location not found. Please try again.");
    }

    if (!toLocation) {
      return res.status(400).send("Location not found. Please try again.");
    }

    const resp = sendTransaction(0, fromLocation, toLocation, finish, supplyID, itemID, name, description, parseInt(price), parseInt(amount));

    res.send(resp);
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }
});

app.post('/connect/sendTransactionContinue', (req, res) => {
  try {
    const { toId, isFinish, supplyID, amount } = req.body;

    const toLocation = findLocation(getLatestLocation(), toId)
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

app.post('/connect/addLocation', (req, res) => {
  const ec = new ecdsa.ec('secp256k1');
  const key = ec.keyFromPublic(getPublicFromWallet(), 'hex');
  const validSignature = key.verify(getPublicFromWallet(), "3046022100a09fc348404e6a0a8363db3e668b56ddacb556dec388543dff754e9fcb4fb1f4022100db16fb41250cc5726493c766387471761fa5d3269d30b52c014f16c203d74b6a");
  if (!validSignature) {
    return res.status(401).send("Only admin's server is allowed to add location");
  }

  try {
    const { name, location } = req.body;
    const { newBlock, privateKey } = generateNextBlockWithLocation(name, location);
    if (newBlock === null) {
      res.status(400).send('could not generate block');
    } else {
      const locateLocation = 'keys/location.json';
      if (fs.existsSync(locateLocation)) {
        const data = readFromFile(locateLocation).concat(privateKey);
        saveToFile(data, locateLocation)
      }
      else {
        saveToFile([privateKey], locateLocation);
      }

      res.status(200).send({ newBlock, privateKey });
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

app.post('/connect/addPeer', (req, res) => {
  try {
    connectToPeers(req.body.peer);
    res.send(200);
  } catch (e) {
    res.status(400).send(e.message)
  }
});

app.post('/connect/stop', (req, res) => {
  res.send({ 'msg': 'stopping server' });
  process.exit();
});

app.post('/connect/changePass', (req, res) => {
  try {
    const { newPass } = req.body;

    const passwordLocation = 'keys/password';
    var newhHash = CryptoJS.SHA256(newPass).toString();;
    fs.writeFileSync(passwordLocation, newhHash);
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message);
  }
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

