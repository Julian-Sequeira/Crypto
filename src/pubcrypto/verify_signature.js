const crypto = require('crypto');

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

export default verifySignature;