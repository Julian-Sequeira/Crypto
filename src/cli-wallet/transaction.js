const crypto = require('crypto');


class Transaction {

    // Enclose all the important constructor data in a single JS object
    // Makes it easily serializable, the id is generated from this
    // In case any of this data is different, the trx id is different
    constructor(previousID, publicKey, address, amount, fee) { 
        this.data = {
            previousID: previousID,
            publicKey: publicKey,
            address: address,
            amount: amount,
            fee: fee
        }
    }

    calculateID() {

    }

}


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