// Easy path management
require('module-alias/register');

// Node modules
const fs = require('fs');

// Custom modules
const mining = require('./mining.js');
const pubcrypto = require('@shared/public-crypto.js');
const utils = require('./utils.js');

/**
 * Generate the genesis block for our cryptocurrency
 * First make a series of transactions
 * Then use the miner to make a block, and save it to 'genesisBlock.json'
 */

// Prepare a transaction where each wallet gets $100 using previous transaction id 0
let previous = [{ previousID: 0, previousIdx: 0 }];
let name = "first";

// Prepare the recipients list for this transaction
let amount = 100;
let recipients = [];
let address, walletName
for (let i = 0; i < utils.NUMWALLETS; i++) {
    walletName = 'wallet' + i.toString();
    address = utils.readPubKey(walletName);
    recipients.push({
        'index': i.toString(),
        'address': address,
        'amount': amount
    })
}

// Make a transactions list, put this transaction as the first one
let transactions = [];
let transaction = utils.makeTransaction(name, previous, recipients);
transactions.push(transaction);


// Send some money (500) to the mobile wallet
// const mobileAddress = utils.readPubKey('mobile');
// recipients = [{index: 0, address: mobileAddress, amount: 500}]
// transaction = utils.makeTransaction(name, previous, recipients);
// transactions.push(transaction);



// Make some more transactions, have everyone send the next guy $50
let publicKey, nextWalletPubKey;
for (let j = 0; j < utils.NUMWALLETS; j++) {

    // Get the sender and recipient's public key
    name = `wallet${j.toString()}`;
    publicKey = utils.readPubKey(name);
    nextWalletPubKey = utils.readPubKey(`wallet${(j+1)%20}`);

    // Prepare a recipient's list, send 50 bucks to the next and keep 49
    recipients = [
        {
            'index' : 0,
            'address' : publicKey,
            'amount' : 49
        },
        {
            'index': 1,
            'address' : nextWalletPubKey,
            'amount': 50
        }
    ]

    // Make a transaction
    previousID = transactions[j].id;
    previous = [{ previousID, previousIdx: 0 }]
    transactions.push(utils.makeTransaction(name, previous, recipients));
}


// Turn all these transactions into the genesis block
// Make a wallet for a miner
utils.makeWallet('miner');
const minerPublicKey = utils.readPubKey(`miner`);
const prevHash = pubcrypto.getHash('DEERCOIN');
const genesisTemplate = mining.getBlockTemplate(minerPublicKey, prevHash, transactions);
const genesisBlock = mining.mineBlock(genesisTemplate);
console.log(genesisBlock);


// Make a directory to house the blocks (figure out a db solution later)
// Save genesisBlock.json in there
utils.makeDir('blocks');
utils.writeData('blocks/genesisBlock.json', genesisBlock);
