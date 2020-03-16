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
    }
})

// Help message - gives information on what flags to use in cmd line
// Start: generate a public/private key pair
// -m: Money to send, -f: Processing fee, -a: Address to send to
const USAGE = "\tUSAGE: ./wallet.js [--start | -i prevId -x previousIdx -t totalAmt -m amount -f fee -a address]"
if (options.help) {
    console.log(USAGE);
}

// Generate key pairs to instantiate the wallet
if (options.start) {

    // Make a directory to store the keys
    try {
        const stat = fs.statSync('keys');
    } catch (e) {
        console.log("Keys directory does not exist, making one");
        fs.mkdirSync('keys');
    }

    // Prompt the user for their passphrase
    let passphrase = reader.question('Passphrase: ', {
        hideEchoBack: true
    })

    console.log("Generating key pairs...");
    pubcrypto.genkeys(passphrase, "keys");
    process.on('exit', () => {
        console.log("Key pairs generated! Your wallet has been instantiated");
    }) 

// Or create and send a transaction
} else {
    if (options.amount === undefined || 
        options.fee === undefined || 
        options.address === undefined || 
        options.prevId === undefined || 
        options.prevIdx === undefined || 
        options.totalAmt === undefined
    ) {
        console.log(USAGE);
    } else {
        
        // Prompt the user for their passphrase
        let passphrase = reader.question('Passphrase: ', {
            hideEchoBack: true
        })

        // Prepare all the necessary transaction ingredients
        const publicKeyBuffer = fs.readFileSync('keys/pubkey.pem');
        const publicKey = publicKeyBuffer.toString('hex');

        const previousID = options.prevId;
        const previousIdx = options.prevIdx;
        const previous = [{previousID, previousIdx}]

        const address = options.address;
        const totalAmt = options.totalAmt;
        const fee = options.fee;
        const amount = options.amount;
        const sendToSelf = totalAmt - amount - fee;

        const type = "normal";
        const timestamp = Date.now();


        // Check that the keys directory exists
        try {
            const stat = fs.statSync('keys');
        } catch (e) {
            console.log("Keys directory does not exist!");
            process.exit(1);
        }
        const directory = "keys";

        const recipients = [
            {'index': 0, 'address': address,'amount': amount}, 
            {'index': 1, 'address': publicKey, 'amount': sendToSelf}
        ];
        
        const data = {publicKey, previous, fee, recipients, type, timestamp}

        // Generating a new transaction- isNew variable tells the constructor to generate an id and signature
        const isNew = true;
        const args = {data, isNew, passphrase, directory};
        let transaction = new Transaction(args);
        console.log(`Your transaction has been created with ID: ${transaction.data.id}\nSending it to a Deercoin node to be processed...`);

        // Send the transaction to a P2P node (hardcoded to the localhost server for now)
        const trxData = transaction.serializedData();
        console.log(transaction);
        axios.post('http://localhost:3001/addTransaction', {trxData
            }).then((res) => {
                console.log("Transaction sent to deercoin node! Please wait for confirmation of insertion onto the blockchain");
            }).catch((err) => {
                // console.error(err);
                console.log("Sending transaction failed");
            });
    }
}

