#!/usr/bin/env node
const axios = require("axios");
const fs = require("fs");
const getopts = require("getopts");
const reader = require("readline-sync");

// Created imports
const pubcrypto = require("./public-crypto.js");
const Transaction = require("./transaction.js");

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
    balance: "b",
    transactions: "r"
  },
  default: {
    start: false,
    s: false,
    new: false,
    n: false
  }
});

// Prompt the user for their passphrase
const askPassphrase = (question = "Passphrase: ") => {
  return reader.question(question, {
    hideEchoBack: true
  });
};

// Help message - gives information on what flags to use in cmd line
const USAGE = "\tUSAGE: ./wallet.js [--start | --balance | --transactions | -i prevId -x previousIdx -t totalAmt -m amount -f fee -a address]";
if (options.help) {
  console.log(USAGE);

// Generate key paris to instantiate a wallet
} else if (options.start) {
    console.log("Generating key pairs...");
    const passphrase = askPassphrase();
    pubcrypto.genkeys(passphrase, 'keys');
    process.on("exit", () => {
        console.log("Key pairs generated! Your wallet has been instantiated");
    })
} else {
    
    // Get the public key (address) of the current user
    let publicKeyBuffer;
    try {
        publicKeyBuffer = fs.readFileSync("pubkey.pem");
    } catch (error) {
        if (error.errno == -2) {
            console.log("Can't find the public key file, please instantiate your wallet");
            return;
        } else {
            console.log("Encountered an unknown error while reading your public key");
            throw error;
        }
    }
    const publicKey = publicKeyBuffer.toString("hex");

    // Get the current balance of the user's public key
    if (options.balance) {
        console.log("Getting your current balance...");
        axios.post("http://localhost:3001/getBalance", { address: publicKey })
            .then(res => {
                const balance = res.data.balance;
                console.log(`the current balance is: ${balance}`);
            }).catch(err => {
                console.error(err);
                console.log("getting balance failed");
            });

    // Get all the user's previous transactions
    } else if (options.transactions) {    
        console.log("Getting transactions...");
        axios.post("http://localhost:3001/getTransactions", { address: publicKey })
            .then(res => {
                const transactions = res.data.transactions;
                console.log(`transactions: ${transactions}`);
            }).catch(err => {
                console.error(err);
                console.log("getting transactions failed");
            });

    // Create and send a transaction        
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
            const passphrase = askPassphrase();

            const previousID = options.prevId;
            const previousIdx = options.prevIdx;
            const previous = [{previousID, previousIdx}]

            const address = options.address;
            const totalAmt = options.totalAmt;
            const fee = options.fee;
            const amount = options.amount;
            const sendToSelf = totalAmt - amount - fee;

            const type = "normal";

            // Check that the keys directory exists
            try {
                const stat = fs.statSync('keys');
            } catch (e) {
                console.log("Keys directory does not exist, please instantiate your wallet");
                process.exit(1);
            }
            const directory = "keys";

            const recipients = [
                {'index': 0, 'address': address,'amount': amount}, 
                {'index': 1, 'address': publicKey, 'amount': sendToSelf}
            ];
            
            const data = {publicKey, previous, fee, recipients, type}

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
}
