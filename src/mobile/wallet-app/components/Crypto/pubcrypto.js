//const crypto = require('crypto');
import { generateKeyPairSync } from "react-native-crypto-js";

/**
 * Generate public/private keys
 * Returned as an object: {publicKey: ..., privatKey: ...}
 */ 

export default function genkeys(passphrase) {

    // console.log(dir);

    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: passphrase    // to encrypt the private key with
        }   
    })

    return {publicKey, privateKey}
}


/**
 * Sign a string with the private key. 
 * How it works- hash the transaction (we'll use SHA256).
 * Then encrypt the hash (let Crypto.js worry about the encryption function).
 */

function createSignature(encryptedKey, string, passphrase, dir) {

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



/**
 * Verify a transaction was signed properly using a public key.
 * Take the transaction, hash it using SHA256.
 * Take the signature, decrypt it using the public key.
 * Compare the two strings for equality (Crypto handles all of this).
 */

function verifySignature(string, signature, publicKey) {
    const verify = crypto.createVerify('SHA256');
    verify.write(string);
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
}


function getHash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
}

// export { genkeys, getHash, createSignature, verifySignature }
// module.exports = { genkeys, getHash, createSignature, verifySignature};