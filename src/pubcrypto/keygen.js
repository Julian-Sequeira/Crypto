const fs = require('fs');
const crypto = require('crypto');

// Where we'll store the generated keys
const KEYS_DIRECTORY = '../keys';
const PUBKEY_PATH = `${KEYS_DIRECTORY}/pubkey.pem`;
const PRIVKEY_PATH = `${KEYS_DIRECTORY}/privkey.pem`;

/**
 * Generate public/private keys, store them to a file
 */ 

function genkeys(passphrase) {

    console.log("generating");
    
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
        fs.open(PUBKEY_PATH, 'w', (err, fd) => {
            if (err) throw err;
            fs.write(fd, publicKey, (err, written, string) => { if (err) throw err; })
            fs.close(fd, (err) => { if (err) throw err; })
        })
    
        // Write the private key to a file 
        // Should be fine if done asynchronously since they aren't logically dependent
        fs.open(PRIVKEY_PATH, 'w', (err, fd) => {
            if (err) throw err;
            fs.write(fd, privateKey, (err, written, string) => { if (err) throw err; })
            fs.close(fd, (err) => { if (err) throw err; }) 
        })
    });
}

module.exports = genkeys;