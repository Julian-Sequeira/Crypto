const crypto = require('crypto');
const pubcrypto = require('./public-crypto.js');
const transactions = require("../miner/transactions.json");

/**
 * Transaction class, built for transactions between 1 sender and 1 receiver currently
 * Includes (static?) functions for verifying transactions as well
 */
class Transaction {

    // Need to make multiple serializable objects
    // One to send over the network (data)
    // One to make the transaction ID and signature (details)
    // Serializing the whole class is a waste of bandwidth
    constructor(args) { 
        this.data = {}

        // This object will be hashed to produce the transaction ID and then signature
        // If anything here is different, the ID and signatures will also be different
        this.data.details = args.details;

        // Create the transaction ID and signature if this is a new transaction
        if (args.isNew) {
            const serial = this.serialize(this.data.details);
            this.data.id = this.calculateID();
            this.data.signature = pubcrypto.createSignature(serial, args.passphrase);

        // Otherwise, we're just dumping existing transaction data into a new object
        } else {
            this.data.id = args.id;
            this.data.signature = args.signature;
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

    //-------------------------------------------------
    

    //[DODO]checks to see if the transaction has not been spent multiple times
    checkSingleSpent(block, transactionID){
        //#get the blockchain
        var thickestBranch = blockchain['genesis'];
        var toCheck = [thickestBranch];
        while (toCheck.length > 0){//loop through every branch
            var blockToCheck = toCheck[0];
            var ChildrenList = blockchain[getBlockHash(blockToCheck)];
            for(var i = 1;i<ChildrenList.length; i++){//loop through everychild
                if(ChildrenList[i]==block){
                    continue;
                }
                var address = ChildrenList[i].details.publicKey;
                if(this.addressInTransaction(transactionID,address)){
                    return false;
                }
                toCheck.push(ChildrenList[i]);
            }
            //the parent block that was fully checked shall be removed
            toCheck.shift();
        }
        return true;
    }

    //[DODO]checks if all the transactions are not overspent when bundled up together
    overallSpent(block){
        var total_amount = 0;
        //all the partial transactions which belongs to the same transaction must have the same previous-id
        for(var transaction = 0; transaction < block.body.length; transaction++){
            if(this.overSpent(block, JSON.stringify(block.details[transaction].previousID)) == false){
                return false
            }
       }
       return true; //TODO: check if the transaction does not go over the required amount
    }

    //[DODO]checks if all the partial transaction in one block adds up
    overSpent(block,transactionID){
        var total_amount = 0;
        //all the partial transactions which belongs to the same transaction must have the same previous-id
        for(var transaction = 0; transaction < block.body.length; transaction++){
            if(JSON.stringify(block.body[transaction].previousID)==transactionID){
               total_amount += block.body[transaction].details.amount;
           }
       }
       return total_amount <= 10; //TODO: check if the transaction does not go over the required amount
    }

    //[DOD]checks if the address exists in the list of transactions
    addressInTransaction(transactions,address){
        for(var transaction = 0; transaction < transactions.length; transaction++){
             if (address === this.data.details.publicKey) {
                return transactions[transaction];
            }
        }
        return false;
    }

    //[DOD]find the previous transaction of the current transaction
    doesExist(blockchain,address){
        //#get the blockchain
        var thickestBranch = blockchain['genesis'];
        var toCheck = [thickestBranch];
        while (toCheck.length > 0){//loop through every branch
            var blockToCheck = toCheck[0];
            var ChildrenList = blockchain[getBlockHash(blockToCheck)];
            for(var i = 1;i<ChildrenList.length; i++){//loop through everychild
                var transaction = ChildrenList.body;
                if(this.addressInTransaction(transaction,address)){
                    return true;
                }
                toCheck.push(ChildrenList[i]);
            }
            //the parent block that was fully checked shall be removed
            toCheck.shift();
        }
        return false;
    }

    // [DOD]Takes in the previous transaction object
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


    //[DOD]check to see if the all the transactions in the block are valid
    CheckBlockTransactions(transactions){
        for(var transaction = 0; transaction < transactions.length; transaction++){
            if(transactions[transaction].verifyTrxSignature() && transactions[transaction].verifyID() && transactions[transaction].checkSingleSpent()){
                var prevTransaction = findPrev();
                if(!verifyFromPrevious(prevTransaction)){
                    return false;
                }
            }else{
                return false;
            }
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