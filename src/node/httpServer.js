const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const Transaction = require('../cli-wallet/transaction.js');
const { broadcast, responseLatestMsg, newBlockMsg, getPeers, connectToPeers } = require('./p2pServer');



const findThickestBranch = require('./blockChain.js').findThickestBranch;

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


  app.post('/availableTransactions', (req, res) => {
    let transactions = getAvailableTransactions(req.address);
    res.send({ transactions });
    res.status(200);
  });




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
      }
      if (transaction.recipient === address) {
        balance += transaction.amount;
      }
      if (transaction.sender !== address && transaction.recipient !== address) {
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

const verifyTransaction = (transaction) => {
  // verify the transaction signature
  isSignatureValid = transaction.verifyTrxSignature();
  if (!isSignatureValid) {
    console.log('transaction signature is invalid');
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
      console.log('referencing invalid transaction id:', id);
      return false;
    }
    if (trans.id in usedTransactions) {
      console.log('referencing the same transaction twice:', trans.id);
      return false;
    }
    usedTransactions.push(trans.id);
    availableMoney += trans.amount;
  }
  let spending = 0;
  transaction.data.recipients.forEach(r => spending += r.amount);
  if (availableMoney < spending) {
    console.log('do not have enough money to transfer');
    return false;
  }
  console.log('transaction verified');
  return true;
};

const getAvailableTransactions = (address) => {
  const usedTransactions = [];
  const availableTransactions = [];
  let currBlock = findThickestBranch(blockchain);
  let preHash = currBlock.header.preHash;
  while (true) {
    // go through all transactions in currBlock
    currBlock.body.forEach((transaction) => {
      // sending money
      if (transaction.details.publicKey === address) {
        // usedTransactions.push(transaction.details.previousID);
        transaction.details.previous.forEach(t => usedTransactions.push(t.previousID));
        transaction.details.recipients.forEach((recipient) => {
          if (recipient.address === address) {
            availableTransactions.push({
              id: transaction.details.id,
              amount: recipient.amount
            });
          }
        });
      } else {
        transaction.details.recipients.forEach((recipient) => {
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
}

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
          transactions.push({
            id: transaction.details.id,
            sender: address,
            recipient: recipient.address,
            amount: recipient.amount,
            date: new Date(currBlock.header.timestamp * 1000)
          });
        });
      } else {
        transaction.details.recipients.forEach((recipient) => {
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


module.exports = initHttpServer;
