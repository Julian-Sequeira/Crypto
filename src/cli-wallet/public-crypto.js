const fs = require('fs');
const crypto = require('crypto');

/**
 * Generate public/private keys
 */ 

function genkeys(passphrase) {
    
    // Generates keys using RSA with mod 4k
    crypto.generateKeyPair('rsa', {
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
    
    // Write both of the generated keys to a file    
    }, (err, publicKey, privateKey) => {
        if (err) throw err; 
    
        // Write the public key to a file (fd = file descriptor)
        fs.open('pubkey.pem', 'w', (err, fd) => {
            if (err) throw err;
            fs.write(fd, publicKey, (err, written, string) => { if (err) throw err; })
            fs.close(fd, (err) => { if (err) throw err; })
        })
    
        // Write the private key to a file 
        // Should be fine if done asynchronously since they aren't logically dependent
        fs.open('privkey.pem', 'w', (err, fd) => {
            if (err) throw err;
            fs.write(fd, privateKey, (err, written, string) => { if (err) throw err; })
            fs.close(fd, (err) => { if (err) throw err; }) 
        })
    });
}


/**
 * Sign a string with the private key. 
 * How it works- hash the transaction (we'll use SHA256).
 * Then encrypt the hash (let Crypto.js worry about the encryption function).
 */

function createSignature(string, passphrase) {

    // Load the encrypted private key from file
    let encryptedKey = fs.readFileSync('privkey.pem');

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



/**
 * Generate public/private keys
 * This time, return the keys themselves, as opposed to saving to a file
 */ 
function genkeysMem(passphrase) {
    // Generates keys using RSA with mod 4k
    const { publicKey, privateKey }  = crypto.generateKeyPairSync('rsa', {
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
    
    // Write both of the generated keys to a file    
    });
    return { "publicKey" : publicKey, "encryptedKey": privateKey };
}

/** Create a signature,
 *  But allow an encrypedkey input as opposed to reading from a file
 */

function createSignatureMem(string, passphrase, encryptedKey) {
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


module.exports = { genkeys, createSignature, verifySignature, genkeysMem, createSignatureMem };