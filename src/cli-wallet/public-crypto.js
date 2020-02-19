const fs = require('fs');
const crypto = require('crypto');

/**
 * Generate public/private keys
 */ 

function genkeys() {
    console.log("Generating a public/private key pair");
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
            passphrase: 'deercoin'    // to encrypt the private key with
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

function signTransaction(transaction) {
    let signature = "";
    
    // Load the encrypted private key from file
    let encryptedKey = fs.readFileSync('privkey.pem');

    // Create a key object for Crypto to decrypt
    // Using hardcoded passphrase for now
    let keyObject = {
        key: encryptedKey,
        format: 'pem',
        type: 'pkcs8',
        passphrase: 'deercoin'
    }

    // Decrypt the private key
    const privateKey = crypto.createPrivateKey(keyObject);
    console.log(privateKey);

    // Using Crypto's sign object to make the signature
    const sign = crypto.createSign('SHA256');
    sign.write(transaction);
    sign.end();
    signature = sign.sign(privateKey, 'hex');
    
    return signature;
}



/**
 * Verify a transaction was signed properly using a public key.
 * Take the transaction, hash it using SHA256.
 * Take the signature, decrypt it using the public key.
 * Compare the two strings for equality.
 */

function verifyTransaction(transaction, signature, publicKey) {
    const verify = crypto.createVerify('SHA256');
    verify.write(transaction);
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
}


module.exports = { genkeys, signTransaction, verifyTransaction };