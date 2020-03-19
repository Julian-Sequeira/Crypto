const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const Transaction = require('../cli-wallet/transaction.js');
const { broadcast, responseLatestMsg } = require('./p2pServer');

const http_port = process.env.HTTP_PORT || 3001;

let blockchain;

const initHttpServer = (chain) => {
  blockchain = chain;
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  app.get('/allBlocks', (req, res) => {
    res.send(blockchain.getBlockChain());
    // let blockchain;
    // let sql = 'SELECT * FROM blockchain;';
    // db.all(sql, [], (err, rows) => {
    //   if (err) { // error
    //     res.status(400);
    //     blockchain = err.message;
    //   } else if (rows.length === 0) { // no highscores
    //     res.status(404);
    //     blockchain = "No BlockChain!";
    //   } else {
    //     res.status(200);
    //     blockchain = rows;
    //   }
    //   res.send(blockchain);
    // });

  });
  app.get('/lastBlock', (req, res) => {
    res.send(blockchain.getLatestBlock());
    // let longest;
    // let sql = 'SELECT * FROM block WHERE blockhash = '
    // sql += '(SELECT child FROM blockchain WHERE blockhash = longest);';
    // db.all(sql, [], (err, rows) => {
    //   if (err) { // error
    //     res.status(400);
    //     longest = err.message;
    //   } else if (rows.length === 0) { // no highscores
    //     res.status(404);
    //     longest = "No BlockChain!";
    //   } else {
    //     res.status(200);
    //     longest = rows;
    //   }
    //   res.send(longest);
    // });
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
    console.log(req.body.newBlock);
    blockchain.addBlock(req.body.newBlock);
    // insert into blocks
    // new Promise(function (resolve, reject) {
    //   let sql = 'INSERT INTO block(blockhash, prehash, difficulty, nonce, timestamp) ';
    //   sql += 'VALUES(?, ?, ?, ?, ?);';
    //   db.get(sql, [req.body.newBlock.header.currHash, req.body.newBlock.header.preHash, req.body.newBlock.header.difficulty, req.body.newBlock.header.nonce, req.body.newBlock.header.timestamp], (err, row) => {
    //     if (err) {
    //       // error
    //       res.status(404);
    //       var result = err.message;
    //       res.json(result);
    //       reject(err.message);
    //     } else {
    //       resolve(1);
    //     }
    //   });

    // }).then(function (result) { // (**)

    //   let sql = 'INSERT INTO blockchain(blockhash, child) ';
    //   sql += 'VALUES(?, ?);';
    //   db.get(sql, [req.body.newBlock.header.currHash, req.body.newBlock.header.preHash], (err, row) => {
    //     if (err) {
    //       // error
    //       res.status(404);
    //       var result = err.message;
    //       res.json(result);
    //       reject(err.message);
    //     } else {
    //       resolve(1);
    //     }
    //   });

    // });
    broadcast(responseLatestMsg());
    res.send();
  });
  app.get('/peers', (req, res) => {
    res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
  });
  app.post('/addPeer', (req, res) => {
    connectToPeers([req.body.peer]);
    res.send();
  });
  app.get('/transactions', (req, res) => res.send(JSON.stringify(blockchain.memPool)));
  // Get a transaction from a wallet or another node
  app.post('/addTransaction', (req, res) => {
    // console.log(req.body.trxData);
    // TODO: check if trans is valid
    // const transaction = JSON.parse(req.body.trxData);
    // const isValidTransaction = validateTransaction(transaction);
    // if (isValidTransaction) {
    //     memPool.push(transaction);
    //     res.status(200);
    //     res.send({msg: "Transaction received"});
    // } else {
    //     res.status(400);
    //     res.send({msg: "Transaction rejected"});
    // }

    console.log(req.body.trxData);
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
  let currBlock = findThickestBranch(blockchain);
  let preHash = currBlock.header.preHash;
  while (true) {
    // go through all transactions in currBlock
    currBlock.body.forEach((transaction) => {
      // sending money
      if (transaction.details.publicKey === address) {
        transaction.details.recipients.forEach((recipient) => {
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
      transaction.details.recipients.forEach((recipient) => {
        if (recipient.address === address) {
          transactions.push({
            sender: transaction.details.publicKey,
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