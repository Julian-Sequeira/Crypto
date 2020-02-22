const crypto = require('crypto');
const Transaction = require('../src/cli-wallet/transaction');

/**
 * We use fake transactions here
 * An array of three transactions will be loaded from file 'transactions.json'
 */
const getFakeTransactions = () => {
  const fs = require('fs');
  const transactions = JSON.parse(fs.readFileSync('./transactions.json', 'utf8'));
  return transactions;
}

/**
 * Get a block of transactions, with the first one being miner's reward.
 * The block body will be later used in mining function (calculate hash value).
 */
const getBlockTemplate = (publicKey) => {
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

  // TODO: update this when get transactions API call is completed
  const transactions = getFakeTransactions();

  // body will be an array of transactions
  const body = [];
  body.push(JSON.stringify(transaction));
  transactions.forEach(t => body.push(JSON.stringify(t)));
  const currHash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('HEX');

  // TODO: construct block template here, need to update block structure and fields
  const header = {
    version: '1.0.0',
    preHash: 'b10b2168c8f76ea759ee6273c08d6fd6cb0b58746ef9cc37bfb01ef754babeab', // SHA256(DeerCoin)
    timestamp: Date.now(),
    currHash,
    difficulty: 3, // TODO: difficulty may change
    nonce: null, // This will be the value for miner to change and get currect hash
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
      console.log(currHash);
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
