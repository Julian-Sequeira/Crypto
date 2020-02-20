const crypto = require('crypto');
const pubcrypto = require('public-crypto.js');


class Transaction {

    // Need to make multiple serializable objects
    // One to send over the network (data)
    // One to make the transaction ID and signature (details)
    // Serializing the whole class is a waste of bandwidth
    constructor(previousID, publicKey, address, amount, fee, passphrase) { 
        this.data = {}

        // This object will be hashed to produce the transaction ID and then signature
        // If anything here is different, the ID and signatures will also be different
        this.data.details = {
            previousID: previousID,
            publicKey: publicKey,
            address: address,
            amount: amount,
            fee: fee
        }

        // Create the transaction ID and signature
        const serial = this.serialize(this.data.details);
        this.data.id = this.calculateID(serial);
        this.data.signature = pubcrypto.createSignature(serial, passphrase);    
    }

    // Modularizing this so that if we use a different serialization 
    // strategy in the future, it can be changed here
    serialize(jsObject) {
        return JSON.stringify(jsObject);
    }

    // Again, we might use a different hash function in the future, so change that here
    calculateID(serial) {
        const hash = crypto.createHash('sha256');
        hash.update(serial);
        return hash.digest('hex');    // **Encoding the ID in hex**
    }
}


module.exports = Transaction;

/**
 * - transaction ID 
 *      - SHA256(JSON.stringify({previousID, pubkey, address, amount, processing fee}))
 * - previous transaction ID (1 for now)
 * - public key of owner
 * - signature
 *      - SIGN(JSON.stringify({previousID, pubkey, address, amount, processing fee}))
 * - hashed address of recipient (1 for now)
 * 
 * - amount
 * - processing fee
 */