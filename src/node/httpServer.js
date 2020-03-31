const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Transaction = require("../cli-wallet/transaction.js");
const { getHash } = require("../shared/utils.js");
const {
  broadcast,
  responseLatestMsg,
  newBlockMsg,
  getPeers,
  connectToPeers
} = require("./p2pServer");

const http_port = process.env.HTTP_PORT || 3001;

let blockchain;

const initHttpServer = chain => {
  blockchain = chain;
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  app.get("/allBlocks", (req, res) => {
    res.send(blockchain.getBlockChain());
  });
  app.get("/lastBlock", (req, res) => {
    res.send(blockchain.getLatestBlock());
  });
  app.get("/block", (req, res) => {
    const hash = req.query.hash;
    if (hash === undefined) {
      return res.send({
        block: null,
        failed: true,
        msg: "no hash found in url"
      });
    }
    const block = blockchain.getBlock(hash);
    const reponse = {
      block,
      failed: block === undefined,
      msg: "block not found"
    };
    res.send(reponse);
  });

  app.get("/getNewBlocks", (req, res) => {
    const blockHash = req.body.hash;
    let foundBlock = null;
    if ((foundBlock = blockchain.isInLongest(blockHash))) {
      res.send(JSON.stringify(cutBlockchain(foundBlock)));
    } else {
    }
  });
  app.post("/addBlock", (req, res) => {
    console.log("got new block");
    // console.log(req.body.newBlock);
    const isValid = verifyBlock(req.body.newBlock);
    if (isValid) {
      blockchain.addBlock(req.body.newBlock);
      broadcast(newBlockMsg(req.body.newBlock));
      res.status(200).send({ msg: "Block accepted" });
    } else {
      console.log("invalid block, please try again");
      res.status(400).send({ msg: "Block rejected" });
    }
  });
  app.get("/peers", (req, res) => {
    res.send(getPeers());
  });
  app.post("/addPeer", (req, res) => {
    connectToPeers([req.body.peer]);
    res.send();
  });
  app.get("/transactions", (req, res) =>
    res.send(JSON.stringify(blockchain.memPool))
  );
  // Get a transaction from a wallet or another node

  app.get("/availabletransactions", (req, res) => {
    let at = getAvailableTransactions(req.address);
    res.send({
      transactions: at
    });
    res.status(200);
  });

  app.post("/addTransaction", (req, res) => {
    // console.log(req.body.trxData);
    console.log("got transactions");
    const transaction = new Transaction(JSON.parse(req.body.trxData));
    const isValid = verifyTransaction(transaction);
    if (isValid) {
      blockchain.memPool.push(transaction);
      // console.log(blockchain.memPool);
      res.status(200);
      res.send({ msg: "Transaction received" });
    } else {
      console.log("invalid transaction, please try again");
      res.status(400);
      res.send({ msg: "Transaction rejected" });
    }
  });
  app.post("/getBalance", (req, res) => {
    // get balance of a wallet user
    let balance = 0;
    const address = req.body.address;
    const transactions = getTransactions(address);
    transactions.forEach(transaction => {
      if (transaction.sender === address) {
        balance -= transaction.amount;
      }
      if (transaction.recipient === address) {
        balance += transaction.amount;
      }
      if (transaction.sender !== address && transaction.recipient !== address) {
        console.log("encountered unknown sender/recipient");
      }
    });
    res.status(200).send({ balance });
  });
  app.post("/getTransactions", (req, res) => {
    // get transactions of a wallet user
    const address = req.body.address;
    const transactions = getTransactions(address);
    res.status(200).send({ transactions });
  });

  app.listen(http_port, () =>
    console.log("Listening http on port: " + http_port)
  );
};

const verifyBlock = block => {
  // validate header
  const {
    preHash, // previous block header hash
    currHash, // current block body hash
    difficulty // number of zeros required
  } = block.header;
  if (!(preHash in blockchain)) {
    console.log("preHash does not exist in the blockchain");
    return false;
  }
  const bodyHash = getHash(block.body);
  if (currHash !== bodyHash) {
    console.log("invalid block transactions body hash");
    return false;
  }
  const blockHash = getHash(block);
  if (blockHash.substring(0, difficulty) !== "0".repeat(difficulty)) {
    console.log("invalid nonce");
    return false;
  }
  // validate transactions body
  for (const transaction of block.body) {
    const isValid = verifyTransaction(transaction);
    if (!isValid) {
      console.log("invalid transaction:", transaction);
      return false;
    }
  }
  console.log("block verified");
  return true;
};

const verifyTransaction = transaction => {
  // verify the transaction signature
  isSignatureValid = transaction.verifyTrxSignature();
  if (!isSignatureValid) {
    console.log("transaction signature is invalid");
    return false;
  }
  // check previous transactions
  const sender = transaction.data.publicKey;
  const previousTransactions = transaction.data.previous; // [{previousID, previousIdx}]
  // get ids of all the previous transactions that the sender is going to use to make the current transaction
  const transactionIds = previousTransactions.map(t => t.previousID);
  // get all transactions where the current sender is available to use
  // we do this to verify that the sender has enough money to make the transaction
  const transactions = getAvailableTransactions(sender); // [{ id, amount }]
  const usedTransactions = [];
  let availableMoney = 0;
  for (const id of transactionIds) {
    const trans = transactions.find(t => t.id === id);
    if (trans === undefined) {
      console.log("referencing invalid transaction id:", id);
      return false;
    }
    if (trans.id in usedTransactions) {
      console.log("referencing the same transaction twice:", trans.id);
      return false;
    }
    usedTransactions.push(trans.id);
    availableMoney += trans.amount;
  }
  let spending = 0;
  transaction.data.recipients.forEach(r => (spending += r.amount));
  if (availableMoney < spending) {
    console.log("do not have enough money to transfer");
    return false;
  }
  console.log("transaction verified");
  return true;
};

const getAvailableTransactions = address => {
  const usedTransactions = [];
  const availableTransactions = [];
  let currBlock = findThickestBranch(blockchain);
  let preHash = currBlock.header.preHash;
  while (true) {
    // go through all transactions in currBlock
    currBlock.body.forEach(transaction => {
      // sending money
      if (transaction.details.publicKey === address) {
        // usedTransactions.push(transaction.details.previousID);
        transaction.details.previous.forEach(t =>
          usedTransactions.push(t.previousID)
        );
        transaction.details.recipients.forEach(recipient => {
          if (recipient.address === address) {
            availableTransactions.push({
              id: transaction.details.id,
              amount: recipient.amount
            });
          }
        });
      } else {
        transaction.details.recipients.forEach(recipient => {
          // receiving money
          if (recipient.address === address) {
            availableTransactions.push({
              id: transaction.details.id,
              amount: recipient.amount
            });
          }
        });
      }
    });
    if (preHash in blockchain === false) break;
    currBlock = blockchain[preHash];
    preHash = currBlock.preHash;
  }
  return availableTransactions.filter(trans => !(trans.id in usedTransactions));
};

const getTransactions = address => {
  const transactions = [];
  let currBlock = findThickestBranch(blockchain);
  let preHash = currBlock.header.preHash;
  while (true) {
    // go through all transactions in currBlock
    currBlock.body.forEach(transaction => {
      // sending money
      if (transaction.details.publicKey === address) {
        transaction.details.recipients.forEach(recipient => {
          transactions.push({
            id: transaction.details.id,
            sender: address,
            recipient: recipient.address,
            amount: recipient.amount,
            date: new Date(currBlock.header.timestamp * 1000)
          });
        });
      } else {
        transaction.details.recipients.forEach(recipient => {
          // receiving money
          if (recipient.address === address) {
            transactions.push({
              id: transaction.details.id,
              sender: transaction.details.publicKey,
              recipient: address,
              amount: recipient.amount,
              date: new Date(currBlock.header.timestamp * 1000)
            });
          }
        });
      }
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
var insertBlock = block => {
  return new Promise(function(resolve, reject) {
    let sql =
      "INSERT INTO block(blockhash, prehash, difficulty, nonce, timestamp) ";
    sql += "VALUES(?, ?, ?, ?, ?);";
    blockchain.db.get(
      sql,
      [
        block.header.currHash,
        block.header.preHash,
        block.header.difficulty,
        block.header.nonce,
        block.header.timestamp
      ],
      (err, row) => {
        if (err) {
          // error
          // res.status(404);
          // var result = err.message;
          // res.json(result);
          reject(err.message);
        } else {
          resolve(1);
        }
      }
    );
  });
};

/*
insert new blockchain data into database
*/
var insertBlockchain = block => {
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO blockchain(blockhash, child) ";
    sql += "VALUES(?, ?);";
    blockchain.db.get(
      sql,
      [block.header.currHash, block.header.preHash],
      (err, row) => {
        if (err) {
          // error
          res.status(404);
          var result = err.message;
          res.json(result);
          reject(err.message);
        } else {
          resolve(1);
        }
      }
    );
  });
};

/*
insert new transactions from new blockchain
*/
var insertAllTransactions = block => {
  return new Promise(function(resolve, reject) {
    let sql =
      "INSERT INTO transaction(id, signature, publicKey, previousID, previousIdx, fee) ";
    sql += "VALUES(?, ?, ?, ?, ?, ?);";
    if (block.body.length == 0) {
      //in case there are no transactions
      reject();
    }

    //insert all transactions into database
    for (var i = 0; i < block.body.length; i++) {
      blockchain.db.get(
        sql,
        [
          block.body[i].id,
          block.body[i].signature,
          block.body[i].details.publicKey,
          block.body[i].details.previousID,
          block.body[i].details.previousIdx,
          block.body[i].details.fee
        ],
        (err, row) => {
          if (err) {
            // error
            res.status(404);
            var result = err.message;
            res.json(result);
            reject(err.message);
          } else {
            insertAllRecipients(block.body[i])
              .then(function(result) {
                insertTransactionRecipient(block.body[i]).catch(reject(0));
              })
              .catch(reject(0));
            resolve(1);
          }
        }
      );
    }
  });
};

/*
insert new block transaction
specify which transaction belongs to which block
*/
var insertBlockTransaction = block => {
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO blocktransaction(blockhash, id)";
    sql += "VALUES(?, ?);";
    //insert all transactions into database
    for (var i = 0; i < block.body.length; i++) {
      blockchain.db.get(
        sql,
        [block.header.currHash, block.body[i].id],
        (err, row) => {
          if (err) {
            // error
            res.status(404);
            var result = err.message;
            res.json(result);
            reject(err.message);
          } else {
            resolve(1);
          }
        }
      );
    }
  });
};

/*
insert new transactions from new blockchain
*/
var insertAllRecipients = transaction => {
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO recipient(index, address, amount) ";
    sql += "VALUES(?, ?, ?);";
    if (transaction.details.recipients == 0) {
      //in case there are no transactions
      reject();
    }

    //insert all transactions into database
    var recipient;
    for (var i = 0; i < transaction.details.recipients.length; i++) {
      recipient = transaction.details.recipients[i];
      blockchain.db.get(
        sql,
        [recipient.index, recipient.address, recipient.amount],
        (err, row) => {
          if (err) {
            // error
            res.status(404);
            var result = err.message;
            res.json(result);
            reject(err.message);
          } else {
            resolve(1);
          }
        }
      );
    }
  });
};

/*
insert new transaction recipient
specify which recipient belongs to which transaction
*/
var insertTransactionRecipient = transaction => {
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO transactionrecipient(id, recipientID)";
    sql += "VALUES(?, ?);";
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
};

module.exports = initHttpServer;
