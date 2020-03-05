const crypto = require('crypto');
const pubcrypto = require('./public-crypto.js');

/**
 * Transaction2 class, built for transactions between 1 sender and 1 receiver currently
 * Includes (static?) functions for verifying transactions as well
 */
class Transaction2 {

    // Need to make multiple serializable objects
    // One to send over the network (data)
    // One to make the transaction ID and signature (details)
    // Serializing the whole class is a waste of bandwidth
    constructor(args, encryptedKey) { 
        this.data = {
            details: null,
            id: null,
            signature: null
        }

        this.data.details = {
            previousID: null,
            previousIdx: null,
            fee: null,
            recipients: null
        }

        // Recipients: [{ index:  ,address:  ,amount:  }]

        // This object will be hashed to produce the transaction ID and then signature
        // If anything here is different, the ID and signatures will also be different
        this.data.details = args.details;

        // Create the transaction ID and signature if this is a new transaction
        if (args.isNew) {
            const serial = this.serialize(this.data.details);
            this.data.id = this.calculateID();
            this.data.signature = pubcrypto.createSignatureMem(serial, args.passphrase, encryptedKey);

        // Otherwise, we're just dumping existing transaction data into a new object
        } else {
            this.data.id = args.id;
            this.data.signature = args.signature;
        }       

        this.encryptedKey = encryptedKey;
    }

    // Modularizing this so that if we use a different serialization 
    // strategy in the future, it can be changed here
    serialize(jsObject) {
        return JSON.stringify(jsObject);
    }

    // Return the serialized data object
    // Don't know how getters work in ES6, too tired to learn right now
    serializedData() {
        return this.serialize(this.data);
    }

    // Again, we might use a different hash function in the future, so change that here
    calculateID() {
        const serial = this.serialize(this.data.details);
        const hash = crypto.createHash('sha256');
        hash.update(serial);
        return hash.digest('hex');    // **Encoding the ID in hex**
    }

    // Verify that a transaction's data contents hash to its id
    verifyID() {
        const serial = this.serialize(this.data.details);
        const calculatedID = this.calculateID(serial);
        return (calculatedID === this.data.id);
    }

    // Verify that a transaction's signature corresponds to the public key provided
    verifyTrxSignature() {
        const publicKey = this.data.details.publicKey;
        const publicKeyBuffer = Buffer.from(publicKey, 'hex');    // Need to use a JS buffer object for Crypto's verify function
        const serial = this.serialize(this.data.details);
        return pubcrypto.verifySignature(serial, this.data.signature, publicKeyBuffer);
    }

    // Takes in the previous transaction object
    // Verifies that the public keys of the last recipient and current sender match
    // Verifies that the amounts all much up
    verifyFromPrevious(prevTransaction) {
        const address = prevTransaction.data.details.address;
        const prevAmount = prevTransaction.data.details.amount;
        if (address === this.data.details.publicKey) {
            if (prevAmount === this.data.details.amount + this.data.details.fee) {
                return true;
            }
        }
        return false;
    }
}


module.exports = Transaction2;

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
 * 
 * A P2P Node needs to:
 *      1. Go check the previous transaction id in the blockchain
 *      2. Make sure the public key provided matches the address of the recipient in previous transaction
 *      3. Verify the current id matches contents of the transaction
 *      4. Verify the signature corresponds to public key provided
 *      5. Verify the transaction is properly formatted
 */