const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const Transaction = require('../cli-wallet/transaction.js');
const { broadcast, responseLatestMsg, newBlockMsg, getPeers, connectToPeers } = require('./p2pServer')

const http_port = process.env.HTTP_PORT || 3001;

let blockchain;

const initHttpServer = (chain) => {
  blockchain = chain;
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  app.get('/allBlocks', (req, res) => {
    res.send(blockchain.getBlockChain());
  });
  app.get('/lastBlock', (req, res) => {
    res.send(blockchain.getLatestBlock());
  });
  app.get('/block', (req, res) => {
    const hash = req.query.hash;
    if (hash === undefined) {
      return res.send({ block: null, failed: true, msg: 'no hash found in url' });
    }
    const block = blockchain.getBlock(hash);
    const reponse = { block, failed: block === undefined, msg: 'block not found' }
    res.send(reponse);
  });

  app.get('/getNewBlocks', (req, res) => {
    const blockHash = req.body.hash;
    let foundBlock = null;
    if (foundBlock = blockchain.isInLongest(blockHash)) {
      res.send(JSON.stringify(cutBlockchain(foundBlock)));
    } else {

    }
  });
  app.post('/addBlock', (req, res) => {
    console.log('got new block');
    // console.log(req.body.newBlock);
    blockchain.addBlock(req.body.newBlock);
    broadcast(newBlockMsg(req.body.newBlock));
    res.send();
  });
  app.get('/peers', (req, res) => {
    res.send(getPeers());
  });
  app.post('/addPeer', (req, res) => {
    connectToPeers([req.body.peer]);
    res.send();
  });
  app.get('/transactions', (req, res) => res.send(JSON.stringify(blockchain.memPool)));
  // Get a transaction from a wallet or another node
  app.post('/addTransaction', (req, res) => {
    let transaction = new Transaction(JSON.parse(req.body.trxData));
    blockchain.memPool.push(transaction);
    // console.log(blockchain.memPool);
    res.status(200);
    res.send();
  });
  app.post('/getBalance', (req, res) => {
    // get balance of a wallet user
    let balance = 0
    const address = req.body.address;
    const transactions = getTransactions(address);
    transactions.forEach((transaction) => {
      if (transaction.sender === address) {
        balance -= transaction.amount;
      } else if (transaction.recipient === address) {
        balance += transaction.amount;
      } else {
        console.log('encountered unknown sender/recipient');
      }
    })
    res.status(200).send({ balance });
  });
  app.post('/getTransactions', (req, res) => {
    // get transactions of a wallet user
    const address = req.body.address;
    const transactions = getTransactions(address);
    res.status(200).send({ transactions });
  });

  app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};

const getTransactions = (address) => {
  const transactions = [];
  let currBlock = blockchain.getLatestBlock();
  let preHash = currBlock.header.preHash;
  while (true) {
    // go through all transactions in currBlock
    currBlock.body.forEach((transaction) => {
      // sending money
      if (transaction.data.publicKey === address) {
        transaction.data.recipients.forEach((recipient) => {
          if (recipient.address === address) {
            return;
          }
          transactions.push({
            sender: address,
            recipient: recipient.address,
            amount: recipient.amount,
            date: new Date(currBlock.header.timestamp * 1000)
          });
        });
        return;
      }
      // receiving money
      transaction.data.recipients.forEach((recipient) => {
        if (recipient.address === address) {
          transactions.push({
            sender: transaction.data.publicKey,
            recipient: address,
            amount: recipient.amount,
            date: new Date(currBlock.header.timestamp * 1000)
          });
        }
      });
    });
    if (preHash in blockchain === false) break;
    currBlock = blockchain[preHash];
    preHash = currBlock.preHash;
  }
  return transactions;
};


module.exports = initHttpServer;