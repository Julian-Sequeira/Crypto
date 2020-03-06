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
    address: "a",
    fee: "f",
    amount: "m",
    prevId: "i",
    balance: "b"
  },
  default: {
    start: false,
    s: false,
    new: false,
    n: false,
    balance: false,
  }
});

// console.log(`options: ${JSON.stringify(options)}`);

// Help message - gives information on what flags to use in cmd line
// Start: generate a public/private key pair
// -m: Money to send, -f: Processing fee, -a: Address to send to
const USAGE =
  "\tUSAGE: ./wallet.js [--start | -i prevId -m amount -f fee -a address | -b]";
if (options.help) {
  console.log(USAGE);
}

// Prompt the user for their passphrase
const askPassphrase = (question = "Passphrase: ") => {
  return reader.question(question, {
    hideEchoBack: true
  });
};

if (options.start) {
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
    console.log("error when loading public key");
    if (error.errno == -2) {
      console.log("no public key file found, generating one...");
      const passphrase = askPassphrase(
        "Please enter a passphrase for your new key pairs: "
      );
      pubcrypto.genkeys(passphrase);
      process.on("exit", () => {
        console.log("Key pairs generated! Your wallet has been instantiated");
      });
      return;
    } else {
      console.log("encountered unknown error while reading public key");
      throw error;
    }
  }
  const publicKey = publicKeyBuffer.toString("hex");

  console.log(`options: ${JSON.stringify(options)}`);

  if (options.balance) {
    // Get the current balance
    console.log("Getting the current balance...");
  } else {
    // create and send a transaction
    if (
      !options.amount ||
      !options.fee ||
      !options.address ||
      !options.prevId
    ) {
      console.log(USAGE);
    } else {
      // Prepare all the necessary transaction ingredients
      const passphrase = askPassphrase();
      const previousID = options.prevId;
      const amount = options.amount;
      const fee = options.fee;
      const address = options.address;
      const details = { publicKey, previousID, amount, fee, address };

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
