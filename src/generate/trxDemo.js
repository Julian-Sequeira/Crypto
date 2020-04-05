// Node modules
const fs = require('fs');
const utils = require('./utils.js');
const axios = require('axios');

// Controls
let control = parseInt(process.argv[2]);


// Read the genesis block on file and get its hash and transaction data
const genesisBlockBuffer = fs.readFileSync('blocks/genesisBlock.json');
const genesisBlock = JSON.parse(genesisBlockBuffer.toString());
let prevTransactions = genesisBlock.body;  



// Don't care about the transaction for the miner reward
// Or the first transaction
prevTransactions.shift(); 
prevTransactions.shift();


// Let the first wallet 1 send the second wallet 5
if (control == 0) {
    let name = 'wallet0';
    let publicKey = utils.readPubKey('wallet0');
    const previousID = prevTransactions[0].id;
    const previous = [{previousID, previousIdx: 0}];

    // First transaction - send 5 deercoin to wallet 2
    let address = utils.readPubKey('wallet1');
    let recipients = [
        {index: 0, publicKey, amount: 44 },
        {index: 1, address, amount: 5}
    ];
    let transaction = utils.makeTransaction(name, previous, recipients);
    console.log(transaction);

    
    let trxData = transaction.serializedData();
    axios.post('http://localhost:3001/addTransaction', {trxData
        }).then((res) => {
            console.log("Transaction sent to deercoin node! Please wait for confirmation of insertion onto the blockchain");
        }).catch((err) => {
            // console.error(err);
            console.log("Sending transaction failed");
        });
}

if (control == 1) {
    let name = 'wallet2';
    const previous = [
        {previousID: prevTransactions[1].id, previousIdx: 0},
        {previousID: prevTransactions[2].id, previousIdx: 1}
    ];

    // First transaction - send 5 deercoin to wallet 2
    let amount = 98;
    let address = utils.readPubKey('wallet2');
    let recipients = [{ index: 0, address, amount }];
    let transaction = utils.makeTransaction(name, previous, recipients);
    console.log(transaction);

    
    let trxData = transaction.serializedData();
    axios.post('http://localhost:3001/addTransaction', {trxData
        }).then((res) => {
            console.log("Transaction sent to deercoin node! Please wait for confirmation of insertion onto the blockchain");
        }).catch((err) => {
            // console.error(err);
            console.log("Sending transaction failed");
        });
}

// Extra transactions

if (control > 1) {
    let num = control*2
    let name = `wallet${num}`;
    const previous = [
        {previousID: prevTransactions[num-1].id, previousIdx: 0},
        {previousID: prevTransactions[num].id, previousIdx: 1}
    ];

    // First transaction - send 5 deercoin to wallet 2
    let amount = 98;
    let address = utils.readPubKey('wallet4');
    let recipients = [{ index: 0, address, amount }];
    let transaction = utils.makeTransaction(name, previous, recipients);
    console.log(transaction);

    
    let trxData = transaction.serializedData();
    axios.post('http://localhost:3001/addTransaction2', {trxData
        }).then((res) => {
            console.log("Transaction sent to deercoin node! Please wait for confirmation of insertion onto the blockchain");
        }).catch((err) => {
            // console.error(err);
            console.log("Sending transaction failed");
        });

}
















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
// let name = 'mobile';
// const previousID = prevTransactions[1].id;
// const previous = [{previousID, previousIdx: 0}];

// // First transaction - send 5 deercoin to wallet 1
// let amount = 5;
// let address = utils.readPubKey('wallet1');
// let recipients = [{ index: 0, address, amount }];
// let transaction = utils.makeTransaction(name, previous, recipients);
// console.log(transaction);

// if (TEST1) {
//     let trxData = transaction.serializedData();
//     axios.post('http://localhost:3001/addTransaction', {trxData
//         }).then((res) => {
//             console.log("Transaction sent to deercoin node! Please wait for confirmation of insertion onto the blockchain");
//         }).catch((err) => {
//             // console.error(err);
//             console.log("Sending transaction failed");
//         });
// }





// // utils.writeData('../mobile/wallet-app/assets/transactions/first.json', transaction);
// // utils.writeData('../mobile/wallet-app/assets/hexkey.js', address);


// // Second transaction - send 5 deercoin to wallet 2 and 5 to wallet 3

// recipients = [
//     {index: 0, address: utils.readPubKey('wallet2'), amount},
//     {index: 0, address: utils.readPubKey('wallet3'), amount}
// ]
// transaction = utils.makeTransaction(name, previous, recipients);
// console.log("\n\n");
// console.log(transaction);

// if (TEST2) {
//     let trxData = transaction.serializedData();
//     axios.post('http://localhost:3001/addTransaction', {trxData
//         }).then((res) => {
//             console.log("Transaction sent to deercoin node! Please wait for confirmation of insertion onto the blockchain");
//         }).catch((err) => {
//             // console.error(err);
//             console.log("Sending transaction failed");
//         });
// }