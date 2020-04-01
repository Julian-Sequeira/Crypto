const fs = require('fs');
const mining = require('./mining.js');
const utils = require('./utils.js');


/** 
 * Generate the second block for our chain
 * Consolidate each wallet's coins, make transactions that depend on 2 previous ones
 */

// Read the genesis block on file and get its hash and transaction data
const genesisBlockBuffer = fs.readFileSync('blocks/genesisBlock.json');
const genesisBlock = JSON.parse(genesisBlockBuffer.toString());

const genesisHash = genesisBlock.header.currHash;
let prevTransactions = genesisBlock.body;  
prevTransactions.shift(); // Don't care about the transaction for the miner reward

// console.log(genesisHash);
// console.log(prevTransactions);

// In a loop, make transactions where each wallet gives itself $98
// let name, publicKey;
// for (let i = 0; i < utils.NUMWALLETS; i++) {

//     name = `wallet${i}`;
//     publicKey = utils.readPubKey(name);

//     let previous = [];
//     firstPreviousID = prevTransactions[i].id;
//     secondPreviousID = prevTransactions[i+1].id;
//     previous.push({previousID: firstPreviousID, previousIdx: 0});
//     previous.push({previousID: secondPreviousID, previousIdx: 1});

//     let recipients = [];
//     recipients.push({
//         index: 0,
//         amount: 98,
        
//     })

// }


// Generating transactions for the demo
let name = 'mobile';
const previousID = prevTransactions[1].id;
const previous = [{previousID, previousIdx: 0}];

// First transaction - send 5 deercoin to wallet 1
let amount = 5;
let address = utils.readPubKey('wallet1');
let recipients = [{ index: 0, address, amount }];
let transaction = utils.makeTransaction(name, previous, recipients);
console.log(transaction);

utils.writeData('../mobile/wallet-app/assets/transactions/first.json', transaction);


// Second transaction - send 5 deercoin to wallet 2 and 5 to wallet 3

recipients = [
    {index: 0, address: utils.readPubKey('wallet2'), amount},
    {index: 0, address: utils.readPubKey('wallet3'), amount}
]
transaction = utils.makeTransaction(name, previous, recipients);
console.log("\n\n");
console.log(transaction);

utils.writeData('../mobile/wallet-app/assets/transactions/second.json', transaction);