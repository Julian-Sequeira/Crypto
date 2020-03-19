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
    // blockchain.db.all(sql, [], (err, rows) => {
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
    // blockchain.db.all(sql, [], (err, rows) => {
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
    // console.log(req.body.newBlock);
    blockchain.addBlock(req.body.newBlock);
    // insert into blocks
    // insertBlock(req.body.newBlock).then(function (result) { // (**)
    //   insertBlockchain(req.body.newBlock);
    // }).then(function (result) {
    //   insertAllTransactions(req.body.newBlock);
    // }).then(function (result) {
    //   insertBlockTransaction(req.body.newBlock);
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

    // console.log(req.body.trxData);
    console.log('got transactions');
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

/*
insert new block into database
*/
var insertBlock = (block) => {
  return new Promise(function (resolve, reject) {
    let sql = 'INSERT INTO block(blockhash, prehash, difficulty, nonce, timestamp) ';
    sql += 'VALUES(?, ?, ?, ?, ?);';
    blockchain.db.get(sql, [block.header.currHash, block.header.preHash,
    block.header.difficulty, block.header.nonce,
    block.header.timestamp], (err, row) => {
      if (err) {
        // error
        // res.status(404);
        // var result = err.message;
        // res.json(result);
        reject(err.message);
      } else {
        resolve(1);
      }
    });

  });
}

/* 
insert new blockchain data into database
*/
var insertBlockchain = (block) => {
  return new Promise(function (resolve, reject) {
    let sql = 'INSERT INTO blockchain(blockhash, child) ';
    sql += 'VALUES(?, ?);';
    blockchain.db.get(sql, [block.header.currHash, block.header.preHash], (err, row) => {
      if (err) {
        // error
        res.status(404);
        var result = err.message;
        res.json(result);
        reject(err.message);
      } else {
        resolve(1);
      }
    });
  });
}

/* 
insert new transactions from new blockchain
*/
var insertAllTransactions = (block) => {
  return new Promise(function (resolve, reject) {
    let sql = 'INSERT INTO transaction(id, signature, publicKey, previousID, previousIdx, fee) ';
    sql += 'VALUES(?, ?, ?, ?, ?, ?);';
    if (block.body.length == 0) {//in case there are no transactions
      reject();
    }

    //insert all transactions into database
    for (var i = 0; i < block.body.length; i++) {
      blockchain.db.get(sql, [block.body[i].id, block.body[i].signature,
      block.body[i].details.publicKey, block.body[i].details.previousID,
      block.body[i].details.previousIdx, block.body[i].details.fee], (err, row) => {
        if (err) {
          // error
          res.status(404);
          var result = err.message;
          res.json(result);
          reject(err.message);
        } else {
          insertAllRecipients(block.body[i]).then(function (result) {
            insertTransactionRecipient(block.body[i]).catch(reject(0));
          }).catch(reject(0));
          resolve(1);
        }
      });
    }
  });
}

/* 
insert new block transaction 
specify which transaction belongs to which block
*/
var insertBlockTransaction = (block) => {
  return new Promise(function (resolve, reject) {
    let sql = 'INSERT INTO blocktransaction(blockhash, id)';
    sql += 'VALUES(?, ?);';
    //insert all transactions into database
    for (var i = 0; i < block.body.length; i++) {
      blockchain.db.get(sql, [block.header.currHash, block.body[i].id], (err, row) => {
        if (err) {
          // error
          res.status(404);
          var result = err.message;
          res.json(result);
          reject(err.message);
        } else {
          resolve(1);
        }
      });
    }
  });
}

/* 
insert new transactions from new blockchain
*/
var insertAllRecipients = (transaction) => {
  return new Promise(function (resolve, reject) {
    let sql = 'INSERT INTO recipient(index, address, amount) ';
    sql += 'VALUES(?, ?, ?);';
    if (transaction.details.recipients == 0) {//in case there are no transactions
      reject();
    }

    //insert all transactions into database
    var recipient;
    for (var i = 0; i < transaction.details.recipients.length; i++) {
      recipient = transaction.details.recipients[i];
      blockchain.db.get(sql, [recipient.index, recipient.address, recipient.amount], (err, row) => {
        if (err) {
          // error
          res.status(404);
          var result = err.message;
          res.json(result);
          reject(err.message);
        } else {
          resolve(1);
        }
      });
    }
  });
}

/* 
insert new transaction recipient 
specify which recipient belongs to which transaction
*/
var insertTransactionRecipient = (transaction) => {
  return new Promise(function (resolve, reject) {
    let sql = 'INSERT INTO transactionrecipient(id, recipientID)';
    sql += 'VALUES(?, ?);';
    //insert all transactions into database
    var recipient;
    for (var i = 0; i < transaction.details.recipients.length; i++) {
      recipient = transaction.details.recipients[i];
      blockchain.db.get(sql, [transaction.id, recipient.index], (err, row) => {
        if (err) {
          // error
          res.status(404);
          var result = err.message;
          res.json(result);
          reject(err.message);
        } else {
          resolve(1);
        }
      });
    }
  });
}

module.exports = initHttpServer;