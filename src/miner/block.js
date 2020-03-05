const crypto = require('crypto');
const Transaction = require('../cli-wallet/transaction');
const axios = require('axios').default;
const CryptoJS = require('crypto');

/**
 * We use fake transactions here
 * An array of three transactions will be loaded from file 'transactions.json'
 */
const getFakeTransactions = () => {
  const fs = require('fs');
  const transactions = JSON.parse(fs.readFileSync('./transactions.json', 'utf8'));
  return transactions;
}

const getTransactions = async () => {
  let transactions = null;
  try{
    // TODO: get peer list and request from peer list
    transactions = (await axios.get('http://localhost:3001/transactions')).data;
  } catch (e) {
    console.log(e);
  }
  return transactions;
}

const getLastBlock = async () => {
  let lastblock = null;
  try{
    // TODO: get peer list and request from peer list
    lastblock = (await axios.get('http://localhost:3001/lastBlock')).data;
  } catch (e) {
    console.log(e);
  }
  return lastblock;
}

function getBlockHash(block) {
  return CryptoJS.createHash('sha256').update(JSON.stringify(block.header)).digest('HEX');
}

// TODO: verify that all transaction are valid for this block
// only use the transactions that are valid

/**
 * Get a block of transactions, with the first one being miner's reward.
 * The block body will be later used in mining function (calculate hash value).
 */
const getBlockTemplate = async (publicKey) => {
  // crete the first transaction in the block body which is the reward for miner
  const details = {
    publicKey: null,
    previousID: '0', // all reward transactions have previous ID of 0
    amount: 1, // the reward amount has to be less or equal to 1
    fee: 0,
    address: publicKey.toString('HEX'),
  };
  const args = {
    details,
    isNew: false,
    id: 0xFFFFFFFF,
    signature: null,
  };
  transaction = new Transaction(args);

  let transactions;
  try{
    transactions = await getTransactions();
  } catch (e) {
    console.log(e);
    return;
  }

  console.log(transactions);

  // body will be an array of transactions
  const body = [];
  body.push(transaction.data);
  transactions.forEach(t => body.push(t));
  const currHash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('HEX');

  let lastBlock;
  try{
    lastBlock = await getLastBlock();
  } catch (e) {
    console.log(e);
    return;
  }

  // console.log(lastBlock);

  // TODO: construct block template here, need to update block structure and fields
  const header = {
    version: '1.0.0',
    preHash: getBlockHash(lastBlock),
    timestamp: Date.now(),
    currHash,
    difficulty: 0, // TODO: difficulty may change
    nonce: 0, // This will be the value for miner to change and get currect hash
  }

  return {
    header,
    body,
  };
};


const mineBlock = (block) => new Promise((resolve, reject) => {
  const difficulty = block.header.difficulty;
  let nonce = Number.MIN_SAFE_INTEGER;
  let currHash = null;
  let count = 0;
  while (nonce <= Number.MAX_SAFE_INTEGER) {
    block.header.nonce = nonce;
    currHash = crypto.createHash('sha256').update(JSON.stringify(block)).digest('hex');
    if (currHash.substring(0, difficulty) === '0'.repeat(difficulty)) {
      // console.log(currHash);
      return resolve(block);
    }
    nonce++;
    if (nonce % 2 ** 51 === 0) console.log(count++);
  }
  return reject('failed to find correct nounce');
});

module.exports = {
  getBlockTemplate,
  mineBlock,
};
