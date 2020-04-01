const pubcrypto = require('../cli-wallet/public-crypto.js');
const Transaction = require('../cli-wallet/transaction.js');


/**
 * Get a block of transactions, with the first one being miner's reward.
 * The block body will be later used in mining function (calculate hash value).
 */

function getBlockTemplate(publicKey, prevHash, transactions) {

    // Create the first transaction in the block body which is the reward for miner
    const data = {
        publicKey: null,
        previous: [{previousID: 'new coins', previousIdx: 0}], // all reward transactions have previous ID of 0
        fee: 0,
        recipients: [{index: 0, address: publicKey.toString('HEX'), amount: 1}],
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
    const currHash = pubcrypto.getHash(body);

    // TODO: construct block template here, need to update block structure and fields
    const header = {
        version: '1.0.0',
        preHash: prevHash,
        timestamp: Date.now(),
        currHash,
        difficulty: 0, // TODO: difficulty may change
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

function mineBlock(template) {
    const difficulty = template.header.difficulty;
    let nonce = Number.MIN_SAFE_INTEGER;
    let currHash = null;
    let count = 0;
    while (nonce <= Number.MAX_SAFE_INTEGER) {
        template.header.nonce = nonce;
        currHash = pubcrypto.getHash(template.header);
        if (currHash.substring(0, difficulty) === '0'.repeat(difficulty)) {
            return template;
        }
        nonce++;
        if (nonce % 2 ** 51 === 0) console.log(count++);
    }
    return false;
}

module.exports = { getBlockTemplate, mineBlock }