const fs = require('fs');
const genkeys = require('./keygen.js');

// Where we store the generated keys
const KEYS_DIRECTORY = 'keys';
const PUBKEY_PATH = `${KEYS_DIRECTORY}/pubkey.pem`;
const PRIVKEY_PATH = `${KEYS_DIRECTORY}/privkey.pem`;

/**
 * Load the public and private keys from a file
 */

function loadKeyPair() {

    // First, check whether keys diretory exists
    fs.stat(KEYS_DIRECTORY, (err, _) => {
        //Check if error defined and the error code is "not exists"
        if (err && err.errno === -2) {
            fs.mkdir(KEYS_DIRECTORY, (err) => {
                if (err) throw err;
            });
        }
    });

    // Check whether the key files exist
    if (!(fs.existsSync(PUBKEY_PATH) && fs.existsSync(PRIVKEY_PATH))) {
        // TODO: Add prompt for passphrase input
        console.log("Keys don't exist yet");
        genkeys(KEYS_DIRECTORY, 'password');    
    }

    // Load public key
    let publicKey = null
    let privateKeyEncrypted = null;
    try {
        publicKey = fs.readFileSync(PUBKEY_PATH);
    } catch (error) {
        console.log('Error when loading public key from file');
        throw error;
    }

    // Load private key (still encryped)
    try {
        privateKeyEncrypted = fs.readFileSync(PRIVKEY_PATH);
    } catch (error) {
        console.log('Error when loading private key from file');
        throw error;
    }

    return { publicKey, privateKeyEncrypted };
};

module.exports = loadKeyPair;