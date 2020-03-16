const crypto = require('crypto');
const pubcrypto = require('./public-crypto.js');

/**
 * Transaction class, built for transactions between 1 sender and 1 receiver currently
 * Includes functions for verifying the transaction as well
 */
class Transaction {

    // args = {
    //     data: {publicKey, previousID, previousIdx, fee, recipients: [{ index, address, amount }]},       
    //     id: transaction ID (not needed if new transaction),
    //     signature: transaction signature (not needed if new transaction),
    //     isNew: boolean to indicate new transaction or not,
    //     passphrase: use this to decrypt the encrypted private key stored on file,
    //     directory: folder where the encrypted private key is stored
    // }

    constructor(args) { 

        this.data = {
            publicKey: null,
            previousID: null,
            previousIdx: null,
            fee: null,
            recipients: null
        }

        this.id = null;
        this.signature = null;

        // This object will be hashed to produce the transaction ID and then signature
        // If anything here is different, the ID and signatures will also be different
        this.data = args.data;

        // Create the transaction ID and signature if this is a new transaction
        if (args.isNew) {
            const serial = this.serialize(this.data);
            this.data.id = this.calculateID();
            this.data.signature = pubcrypto.createSignature(serial, args.passphrase, args.directory);

        // Otherwise, we're just dumping existing transaction data into a new object
        } else {
            this.id = args.id;
            this.signature = args.signature;
        }       
    }

    // Modularizing this so that if we use a different serialization 
    // strategy in the future, it can be changed here
    serialize(jsObject) {
        return JSON.stringify(jsObject);
    }

    // Return the serialized data object
    // Don't know how getters work in ES6, too tired to learn right now
    serializedData() {
        return this.serialize(this);
    }

    // Again, we might use a different hash function in the future, so change that here
    calculateID() {
        const serial = this.serialize(this.data);
        const hash = crypto.createHash('sha256');
        hash.update(serial);
        return hash.digest('hex');    // **Encoding the ID in hex**
    }

    // Verify that a transaction's data contents hash to its id
    verifyID() {
        const serial = this.serialize(this.data);
        const calculatedID = this.calculateID(serial);
        return (calculatedID === this.id);
    }

    // Verify that a transaction's signature corresponds to the public key provided
    verifyTrxSignature() {
        const publicKey = this.data.publicKey;
        const publicKeyBuffer = Buffer.from(publicKey, 'hex');    // Need to use a JS buffer object for Crypto's verify function
        const serial = this.serialize(this.data);
        return pubcrypto.verifySignature(serial, this.signature, publicKeyBuffer);
    }

    // Takes in the previous transaction object
    // Verifies that the public keys of the last recipient and current sender match
    // Verifies that the amounts all much up
    verifyFromPrevious(prevTransaction, previousIdx) {

        // Check the public keys match the recpient of the previous transaction
        const prevRecipient = prevTransaction.data.recipients[previousIdx];
        const address = prevRecipient.address;
        if (address !== this.data.publicKey) {
            return false;
        }

        // Check that the money sent matches the money from the previous transaction
        const prevAmount = prevRecipient.amount;
        let sentAmount = this.data.fee;
        for (recipient in this.data.recipients) {
            sentAmount += recipient.amount;
        }
        if (sentAmount > prevAmount) {
            return false
        }
        return true;
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
 * 
 * A P2P Node needs to:
 *      1. Go check the previous transaction id in the blockchain
 *      2. Make sure the public key provided matches the address of the recipient in previous transaction
 *      3. Verify the current id matches contents of the transaction
 *      4. Verify the signature corresponds to public key provided
 *      5. Verify the transaction is properly formatted
 */