// Easy path management
require('module-alias/register');

// Node modules
const axios = require('axios').default;
const crypto = require('crypto');

// Custom modules
const Transaction = require('@shared/transaction');


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
    let difficulty = null;
    try{
        // TODO: get peer list and request from peer list
        transactions = (await axios.get('http://localhost:3001/transactions')).data;
        difficulty = (await axios.get('http://localhost:3001/difficulty')).data;
    } catch (e) {
        console.log(e);
    }
    return transactions;
}

const getDifficulty = async () => {
    let difficulty = null;
    try{
        difficulty = (await axios.get('http://localhost:3001/difficulty')).data.difficulty;
    } catch (e) {
        console.log(e);
    }
    console.log(difficulty);
    return difficulty;
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
    return crypto.createHash('sha256').update(JSON.stringify(block.header)).digest('HEX');
}

function getHash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
}

// TODO: verify that all transaction are valid for this block
// only use the transactions that are valid

/**
 * Get a block of transactions, with the first one being miner's reward.
 * The block body will be later used in mining function (calculate hash value).
 */
const getBlockTemplate = async (publicKey, prevHash, transactions) => {

    // Get the list of transactions to turn into a block
    if (transactions === undefined) {
        try{
            // transactions = getFakeTransactions();
            transactions = await getTransactions();
        } catch (e) {
            console.log(e);
            return;
        }
    }

    // Get the target difficulty
    let difficulty;
    try {
        difficulty = await getDifficulty();
    } catch (e) {
        console.log(e);
        return;
    }

    // Create the first transaction in the block body which is the reward for miner
    const data = {
        publicKey: null,
        previous: [{previousID: 'new coins', previousIdx: 0}], // all reward transactions have previous ID of 0
        fee: 0,
        recipients: [{index: 0, address: publicKey.toString('HEX'), amount: transactions.length}],
        timestamp: Date.now(),
        type: 'miner'
    };
    const args = {
        data,
        isNew: false,
        id: null,
        signature: null,
    };
    const transaction = new Transaction(args);

    // Create the body of the block, an array of transactions
    const body = [];
    body.push(transaction);
    transactions.forEach(t => body.push(t));
    const currHash = getHash(body);

    // Get the hash of the previous block
    if (prevHash === undefined) {
        try{
            let lastBlock = await getLastBlock();
            prevHash = getBlockHash(lastBlock);
        } catch (e) {
            console.log(e);
            return;
        }
    }

    // TODO: construct block template here, need to update block structure and fields
    const header = {
        version: '1.0.0',
        prevHash: prevHash,
        timestamp: Date.now(),
        currHash,
        difficulty, 
        nonce: 0, // This will be the value for miner to change and get currect hash
    }

    return {
        header,
        body,
    }
}

/**
 *  Mine transactions into a block
 *  First make the block template
 *  Then keep trying new nonces until we get a hash with the proper number of preceding 0s
 */

const mineBlock = (block) => new Promise((resolve, reject) => {
    const difficulty = block.header.difficulty;
    let nonce = Number.MIN_SAFE_INTEGER;
    let count = 0;
    console.log(`current difficulty for this block is ${difficulty}`);
    while (nonce <= Number.MAX_SAFE_INTEGER) {
        block.header.nonce = nonce;
        block.header.currHash = getHash(block);
        if (block.header.currHash.substring(0, difficulty) === '0'.repeat(difficulty)) {
            console.log(`got hash ${block.header.currHash} - Success! There are enough 0's!`);
            return resolve(block);
        }
        nonce++;
        if (block.header.currHash.substring(0, difficulty-1) === '0'.repeat(difficulty-1) && block.header.currHash[difficulty] !== '0') {
            console.log(`got hash ${block.header.currHash} - not enough 0's`);
        }
        if (nonce % 2 ** 51 === 0) console.log(count++);
    }
    return reject('Failed to find correct nonce!');
})

module.exports = {
    getBlockTemplate,
    mineBlock,
};
