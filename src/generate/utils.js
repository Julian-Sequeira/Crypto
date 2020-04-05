// Easy path management
require('module-alias/register');

// Node modules
const fs = require('fs');

// Custom modules
const pubcrypto = require('@shared/public-crypto.js');
const Transaction = require('@shared/transaction.js');

/**
 * The number of wallets we have to work with
 * The standard fee of a transaction
 * Only need to change these here
 */

const NUMWALLETS = 20;
const FEE = 1;

/**
 * Check if a directory exists,
 * If not make one
 */

function makeDir(dirName) {
    try {
        stat = fs.statSync(dirName);
    } catch (e) {
        fs.mkdirSync(dirName);
    }
}

/** 
 * Generate keys into a directory named wallet/name 
 * The private encryption key will be the name itself
**/

function makeWallet(name) {
    const directory = `wallets/${name}`;
    makeDir(directory);
    pubcrypto.genkeys(name, directory);
}


/**
 * Read a public key from a pem file
 * Return a HEX string of the public key
 */

function readPubKey(name) {
    const publicKeyBuffer = fs.readFileSync(`wallets/${name}/pubkey.pem`);
    return publicKeyBuffer.toString('hex');
}

/**
 * Prepare a transaction for a given wallet
 */

function makeTransaction(name, previous, recipients) {
    const directory = `wallets/${name}`;
    const publicKey = readPubKey(name);
    const type = "normal";
    const data = {publicKey, previous, fee: FEE, recipients, type}
    const args = {
        data, 
        isNew: true,
        passphrase: name,
        directory
    }
    const transaction = new Transaction(args);
    return transaction;
}

/**
 * Write data to a file
 */

function writeData(fname, data) {
    try {
        fs.writeFileSync(fname, JSON.stringify(data));
    } catch (err) {
        console.log("Error writing data to file");
        throw err;
    }
}

module.exports = { 
    makeDir, 
    makeTransaction, 
    makeWallet, 
    NUMWALLETS, 
    readPubKey,
    writeData
}