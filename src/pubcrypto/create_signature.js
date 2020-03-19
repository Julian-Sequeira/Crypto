const fs = require('fs');
const crypto = require('crypto');

// Where we the keys
const KEYS_DIRECTORY = 'keys';
const PRIVKEY_PATH = `${KEYS_DIRECTORY}/privkey.pem`;

/**
 * Sign a string with the private key. 
 * How it works- hash the transaction (we'll use SHA256).
 * Then encrypt the hash (let Crypto.js worry about the encryption function).
 */

function createSignature(string, passphrase) {

    // Load the encrypted private key from file
    let encryptedKey = fs.readFileSync(PRIVKEY_PATH);

    // Create a key object for Crypto to decrypt
    // Using hardcoded passphrase for now
    let keyObject = {
        key: encryptedKey,
        format: 'pem',
        type: 'pkcs8',
        passphrase: passphrase
    }

    // Decrypt the private key
    const privateKey = crypto.createPrivateKey(keyObject);

    // Using Crypto's sign object to make the signature
    const sign = crypto.createSign('SHA256');
    sign.write(string);
    sign.end();
    return sign.sign(privateKey, 'hex');    // ** The signature is encoded in hex **
}

module.exports = createSignature;