// Created imports
const pubcrypto = require('../cli-wallet/public-crypto.js');
const Transaction = require('../cli-wallet/transaction.js');
const fs = require('fs');

/**
 * Generate the genesis block for our cryptocurrency
 * First make a series of transactions
 * Then use the miner to make a block, and save it to 'genesisBlock.json'
 */

const NUMWALLETS = 20;
const NUMROUNDS = 10;

// Make a folder for all the wallets
let stat;
try { 
    stat = fs.statSync('wallets');
} catch (e) {
    fs.mkdirSync('wallets');
}

// Make the starting wallet
try { 
    stat = fs.statSync('wallets/first');
} catch (e) {
    fs.mkdirSync('wallets/first');
}
pubcrypto.genkeys('first', 'wallets/first')

// Make the other NUMWALLETS wallets
for (let i = 0; i < NUMWALLETS; i++) {
    let name = 'wallet' + i.toString();
    let walletFolder = 'wallets/' + name;
    try { 
        stat = fs.statSync(walletFolder);
    } catch (e) {
        fs.mkdirSync(walletFolder);
    }
    pubcrypto.genkeys(name, walletFolder);
}

// Prepare a transaction where each wallet gets $100 using previous transaction id 0
// Prepare the transaction ingredients for the sender
let amount = 100;
let fee = 1;

let publicKeyBuffer = fs.readFileSync('wallets/first/pubkey.pem');
let publicKey = publicKeyBuffer.toString('hex');

let previousID = 0;
let previousIdx = 0;
let previous = [{previousID, previousIdx}]

let isNew = true;
let passphrase = "first";
let directory = "wallets/first";

let type = "normal";
let timestamp = Date.now();

// Prepare the recipients list for this transaction
let recipients = [];
for (let i = 0; i < NUMWALLETS; i++) {
    let name = 'wallet' + i.toString();
    let walletFolder = 'wallets/' + name + "/";
    publicKeyBuffer = fs.readFileSync(walletFolder + 'pubkey.pem');
    let address = publicKeyBuffer.toString('hex');
    recipients.push({
        'index': i.toString(),
        'address': address,
        'amount': amount
    })
}

// Make a transaction object
let data = {publicKey, previous, fee, recipients, type, timestamp}
let args = {data, isNew, passphrase, directory}
let transactions = [];
transactions.push(new Transaction(args));
// console.log(transaction);


// Function
function makeSenderInfo(name, fee, previousID, previousIdx) {
    const previous = [{previousID, previousIdx}];
    const directory = `wallets/${name}`;
    const publicKeyBuffer = fs.readFileSync(`${directory}/pubkey.pem`);
    const publicKey = publicKeyBuffer.toString('hex');
    const type = "normal";
    const timestamp = Date.now();
    const data = {publicKey, previous, fee, type, timestamp}
    return data;
}

let d = makeSenderInfo('first', 1, 0, 0);
// console.log(d);
// console.log(transactions);

// Make some more transactions, have everyone send the next guy $99

for (let j = 0; j < NUMWALLETS; j++) {
    previousID = transactions[j].id;
    name = `wallet${j.toString()}`;
    directory = `wallets/${name}`;
    data = makeSenderInfo(name, 1, previousID, 0);
    let nextWalletName = `wallet${(j+1)%20}`;
    publicKeyBuffer = fs.readFileSync(`wallets/${nextWalletName}/pubkey.pem`);
    nextWalletPubKey = publicKeyBuffer.toString('hex');
    recipients = [{
        'index': j.toString(),
        'address' : nextWalletPubKey,
        'amount': 99
    }]
    data.recipients = recipients;
    const args = {
        data,
        isNew: true,
        passphrase: name,
        directory
    }
    transactions.push(new Transaction(args));
}

console.log(transactions);







// // Generate starting wallet
// let first = pubcrypto.genkeysMem('passphrase');

// const NUMWALLETS = 20;

// // Generate 8 more wallets
// let wallets = [];
// for (let i = 0; i < NUMWALLETS; i++) {
//     wallets.push(pubcrypto.genkeysMem('passphrase' + i.toString()));
// }

// // Prepare a transaction where each wallet gets $100 using prevID 0 and the starting wallet
// const passphrase = "passphrase";
// const publicKey = first.publicKey;
// const encryptedKey = first.encryptedKey;
// const previousID = 0;
// const previousIdx = 0;
// const fee = 0.05;
// const amount = 100;
// let recipients = [];

// const publicKeyBuffer = fs.readFileSync('../cli-wallet/pubkey.pem');
// const address = publicKeyBuffer.toString('hex');

// let index;
// for (let i = 0; i < NUMWALLETS; i++) {
//     // address = wallets[i].publicKey;
//     index = i.toString();
//     recipients.push({
//         'index': index,
//         'address': address,
//         'amount': amount
//     })
// }

// // console.log(recipients);

// const details = {publicKey, previousID, previousIdx, fee, recipients};
// const isNew = true;
// const args = {details, isNew, passphrase};
// let transaction = new Transaction2(args, encryptedKey);

// const trxData = transaction.serializedData();
// try {
//     fs.writeFileSync("../miner/transactions.json", trxData);
// } catch(err) {
//     console.log(err);
// }


// axios.post('http://localhost:3001/addTransaction', {trxData
//     }).then((res) => {
//         console.log("Transaction sent to deercoin node! Please wait for confirmation of insertion onto the blockchain");
//     }).catch((err) => {
//         // console.error(err);
//         console.log("Sending transaction failed");
//     });



// Now let each wallet give $10 to wallet










// // Starting amounts of money
// let money = [];
// for (let i = 0; i < 8; i++) {
//     money.push(100);
// }


// Now let each wallet send transactions to each other randomly

// const numTransactions = 100;
// for (let i = 0; i < numTransactions; i++) {
    
//     // Pick a random wallet
//     // Choose a random amount for that wallet to spend and subtract from the amount that wallet has
//     let randWallet = Math.floor(Math.random() * 8);
//     let remaining = money[randWallet];
//     let fee = 0.05
//     let randAmount = Math.floor(Math.random() * (remaining - fee));
//     money[randWallet] = money[randWallet] - fee - randAmount;

//     // 



// }
