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
// Start: generate a public/private key pair
// -m: Money to send, -f: Processing fee, -a: Address to send to
const USAGE =
  "\tUSAGE: ./wallet.js [--start | -i prevId -x previousIdx -t totalAmt -m amount -f fee -a address]";

if (options.help) {
  console.log(USAGE);
} else if (options.start) {
  // Generate key pairs to instantiate the wallet
  console.log("Generating key pairs...");
  const passphrase = askPassphrase(
    "Please enter a passphrase for your new key pairs: "
  );
  pubcrypto.genkeys(passphrase);
  process.on("exit", () => {
    console.log("Key pairs generated! Your wallet has been instantiated");
  });
} else {
  // Get the public key (address) of the current user
  let publicKeyBuffer;
  try {
    publicKeyBuffer = fs.readFileSync("pubkey.pem");
  } catch (error) {
    if (error.errno == -2) {
      console.log("can't find public key file");
      return;
    } else {
      console.log("encountered unknown error while reading public key");
      throw error;
    }
  }
  const publicKey = publicKeyBuffer.toString("hex");
  if (options.balance) {
    // Get the current balance
    console.log("Getting the current balance...");
    axios
      .post("http://localhost:3001/getBalance", { address: publicKey })
      .then(res => {
        const balance = res.data.balance;
        console.log(`the current balance is: ${balance}`);
      })
      .catch(err => {
        console.error(err);
        console.log("getting balance failed");
      });
  } else if (options.transactions) {
    // Get transactions
    console.log("Getting transactions...");
    axios
      .post("http://localhost:3001/getTransactions", { address: publicKey })
      .then(res => {
        const transactions = res.data.transactions;
        console.log(`transactions: ${transactions}`);
      })
      .catch(err => {
        console.error(err);
        console.log("getting transactions failed");
      });
  } else {
    // create and send a transaction
    if (
      !options.amount ||
      !options.fee ||
      !options.address ||
      !options.prevId ||
      !options.prevIdx ||
      !options.totalAmt
    ) {
      console.log(options);
      console.log(USAGE);
    } else {
      // Prepare all the necessary transaction ingredients
      const passphrase = askPassphrase();
      const previousID = options.prevId;
      const amount = options.amount;
      const fee = options.fee;
      const address = options.address;
      const totalAmt = options.totalAmt;
      const sendToSelf = totalAmt - amount - fee;
      const previousIdx = options.prevIdx;
      const recipients = [
        { index: 0, address: address, amount: amount },
        { index: 1, address: publicKey, amount: sendToSelf }
      ];
      const details = { publicKey, previousID, previousIdx, fee, recipients };

      // Generating a new transaction- isNew variable tells the constructor to generate an id and signature
      const isNew = true;
      const args = { details, isNew, passphrase };
      let transaction = new Transaction(args);
      console.log(
        `Your transaction has been created with ID: ${transaction.data.id}\nSending it to a Deercoin node to be processed...`
      );

      // Send the transaction to a P2P node (hardcoded to the localhost server for now)
      const trxData = transaction.serializedData();
      axios
        .post("http://localhost:3001/addTransaction", { trxData })
        .then(res => {
          console.log(
            "Transaction sent to deercoin node! Please wait for confirmation of insertion onto the blockchain"
          );
        })
        .catch(err => {
          console.error(err);
          console.log("Sending transaction failed");
        });
    }
  }
}
