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

// Wallets folder
let stat = fs.statSync('wallets');
if (!stat.isDirectory()) {
    fs.mkdirSync('wallets');
}

// Make the starting wallet
stat = fs.statSync('wallets/first');
if (!stat.isDirectory()) {
    fs.mkdirSync('wallets/first');
}
pubcrypto.genkeys('first', 'wallets/first')

// Make the other NUMWALLETS wallets
for (let i = 0; i < NUMWALLETS; i++) {
    let name = 'wallet' + i.toString();
    let folder = 'wallets' + name;
    stat = fs.statSync(folder);
    if (!stat.isDirectory()) fs.mkdirSync(folder);
    pubcrypto.genkeys(name, folder);
}

// Prepare a transaction where each wallet gets $100 using previous transaction id 0


















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
