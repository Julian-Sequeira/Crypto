#!/usr/bin/env node

// Node libraries
const axios = require('axios');
const fs = require('fs');
const getopts = require("getopts");
const reader = require('readline-sync');

// Created imports
const pubcrypto = require('./public-crypto.js');
const Transaction = require('./transaction.js');

// Parse cmdline args
const options = getopts(process.argv, {
    alias: {
        help: "h",
        start: "s",
        passphrase: "p",
        totalAmt: "t",
        address: "a",
        fee: "f",
        amount: "m",
        prevIdx: "x",
        prevId: "i",
    },
    default: {
        start: false,
        s: false,
        new: false,
        n: false
    }
})

// Help message - gives information on what flags to use in cmd line
// Start: generate a public/private key pair
// -m: Money to send, -f: Processing fee, -a: Address to send to
const USAGE = "\tUSAGE: ./wallet.js [--start | -i prevId -x previousIdx -t totalAmt -m amount -f fee -a address]"
if (options.help) {
    console.log(USAGE);
}

// Prompt the user for their passphrase
let passphrase = reader.question('Passphrase: ', {
    hideEchoBack: true
})


// Generate key pairs to instantiate the wallet
if (options.start) {
    console.log("Generating key pairs...");
    pubcrypto.genkeys(passphrase);
    process.on('exit', () => {
        console.log("Key pairs generated! Your wallet has been instantiated");
    }) 

// Or create and send a transaction
} else {
    if (options.amount === undefined || options.fee === undefined || options.address === undefined || options.prevId === undefined || options.prevIdx === undefined || options.totalAmt === undefined) {
        console.log(options);
        console.log(USAGE);
    } else {
        
        // Prepare all the necessary transaction ingredients
        const publicKeyBuffer = fs.readFileSync('pubkey.pem');
        const publicKey = publicKeyBuffer.toString('hex');
        const previousID = options.prevId;
        const amount = options.amount;
        const fee = options.fee;
        const address = options.address;
        const totalAmt = options.totalAmt;
        const sendToSelf = totalAmt - amount - fee;
        const previousIdx = options.prevIdx;

        const recipients = [
            {'index': 0, 'address': address,'amount': amount}, 
            {'index': 1, 'address': publicKey, 'amount': sendToSelf}
        ];
        const details = {publicKey, previousID, previousIdx, fee, recipients}

        // Generating a new transaction- isNew variable tells the constructor to generate an id and signature
        const isNew = true;
        const args = {details, isNew, passphrase};
        let transaction = new Transaction(args);
        console.log(`Your transaction has been created with ID: ${transaction.data.id}\nSending it to a Deercoin node to be processed...`);

        // Send the transaction to a P2P node (hardcoded to the localhost server for now)
        const trxData = transaction.serializedData();
        axios.post('http://localhost:3001/addTransaction', {trxData
            }).then((res) => {
                console.log("Transaction sent to deercoin node! Please wait for confirmation of insertion onto the blockchain");
            }).catch((err) => {
                console.error(err);
                console.log("Sending transaction failed");
            });
    }
}

