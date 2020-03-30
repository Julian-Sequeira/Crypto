const genesisBlock = require("../genesisBlock.json");
const { getBlockHash } = require('../shared/utils.js');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/Deercoin';



class Database{
    constructor(){
        this.genesisBlock = genesisBlock;
        this.getBlockHash = getBlockHash;
        this.genesisHash = this.getBlockHash(this.genesisBlock);
        this.MongoClient = MongoClient;
        this.url = url;
    }
    
    init = () => {
        this.MongoClient.connect(this.url, function (err, client) {
            if (err) throw err;
            var db = client.db('Deercoin');    
            const genesisHash = this.getBlockHash(this.genesisBlock); 
            new Promise(function(resolve, reject) {
        
                //deleting the collections
                if(db.blockchain)db.blockchain.drop();
                if(db.blocks)db.blocks.drop();
                if(db.transactions)db.transactions.drop();
                if(db.recipients)db.recipients.drop();
                return resolve(1);
        
            }).then(function(result) {
        
                //creating new collections
                db.createCollection("blockchain", function (err, res) {
                    if (err) throw err;
                    console.log("blockchain collection created!");
                    return result;
                });
        
            }).then(function(result) {
        
                //creating new collections
                db.collection('blockchain').insertMany([
                    {
                        "blockhash": "genesisHash",
                        "nextHashes": [genesisHas]
                    },
                    {
                        "blockhash": "longestHash",
                        "nextHashes": [genesisHas]
                    },
                    {
                        "blockhash": "",
                        "nextHashes": []
                    }
        
                ]);
                return result;
            }).then(function(result) {
        
                //creating new collections
                db.createCollection("blocks", function (err, res) {
                    if (err) throw err;
                    console.log("blocks collection created!");
                    db.collection('blocks').insertOne({
                        "hash": genesisHash,
                        "block": this.genesisBlock
                    });
                    return result;
                });
        
        
            }).then(function(result) {
        
                //creating new collections
                db.createCollection("transactions", function (err, res) {
                    if (err) throw err;
                    console.log("transactions collection created!");
                    return result;
                });
        
            }).then(function(result) {
        
                //creating new collections
                db.createCollection("recipients", function (err, res) {
                    if (err) throw err;
                    console.log("recipinets collection created!");
                    return result;
                });
        
            }).then(function(result) {
        
                //creating new collections
                db.createCollection("mempool", function (err, res) {
                    if (err) throw err;
                    console.log("mempool collection created!");
                    return result;
                });
        
            }).then(function(result) {
                client.close();
            })
        });
    }

    addBlock = (newBlock) => {
        this.MongoClient.connect(this.url, function(err, db) {
            new Promise((resolve,reject)=>{
                db.collection('Blocks').insertOne({
                    "preHash": newBlock.header.preHash,
                    "timestamp": newBlock.header.timetime,
                    "currHash": newBlock.header.currHash,
                    "difficulty": newBlock.header.difficulty,
                    "nonce":newBlock.header.nonce,
                    "transactions":newBlock.body
                });
                return resolve(1);
            }).then(function(result){
                return this.addToBlockchain(newBlock.header.currHash);
            }).then(function(result){
                return this.updateBlockchain(newBlock.header.preHash,newBlock.header.currHash)
            })
        }); 
    }

    addToBlockchain = (hash) => {
        return new Promise((resolve,reject) => {
            this.MongoClient.connect(this.url, function(err, db) {
                db.collection('blockchain').insertOne({
                    "blockhash": hash,
                    "nextHashes": []
                });
            });
        });
    }

    updateBlockchain = (preHash,hash) => {
        return new Promise((resolve,reject) => {
            var collection = db.collection('blockchain');
            var cursor = collection.find({"blockhash": preHash});
            //There is only suppose to be one item inside the cursor
            cursor[0].nextHashes.push(hash);
            this.MongoClient.connect(this.url, function(err, db) {
                db.collection('blockchain').updateOne({
                "blockhash": preHash
                }, {
                    $set: {
                        "nextHashes": cursor[0].nextHashes
                    }
                });
            });
        });
    }

    addTransactionToBlock = (blockHash, transaction) => {
        this.addTransaction(transaction).then((result)=>{
            var collection = db.collection('blocks');
            var cursor = collection.find({"currHash": blockHash});
            //There is only suppose to be one item inside the cursor
            cursor[0].transactions.push(hash);
            this.MongoClient.connect(this.url, function(err, db) {
                db.collection('blocks').updateOne({
                    "currHash": blockHash
                }, {
                    $set: {
                        "transactions": cursor[0].transactions
                    }
                });
            })
        });
    }

    addTransaction = (transaction) => {
        return new Promise((resolve,reject) => {
            this.MongoClient.connect(this.url, function(err, db) {
                db.collection('transactions').insertOne({
                    "id" : transaction.id,
                    "signature":transaction.signature,
                    "details":{
                        "publicKey": transaction.details.publicKey,
                        "previousID": transaction.details.previousID,
                        "previousIdx": transaction.details.previousIdx,
                        "fee": transaction.details.fee,
                        "recipients": transaction.details.recipients
                    }
                });
            });
            return resolve(1);
        });
    }

    getTransaction = (transactionId) => {
        var collection = db.collection('transactions');
        var cursor = collection.find({"id":transactionId});
        return cursor[0];
    }

    getBlock = (blockHash) => {
        var block = {};
        block["header"] = {};
        block["body"] = [];
        var collection = db.collection('blocks');
        var cursor = collection.find({"currHash":blockHash});
        if(cursor.length < 1){
            return null
        }

        block["header"]["preHash"] = cursor[0].preHash;
        block["header"]["timestamp"] = cursor[0].timestamp;
        block["header"]["currHash"] = cursor[0].currHash;
        block["header"]["difficulty"] = cursor[0].difficulty;
        block["header"]["nonce"] = cursor[0].nonce;

        for(var transactionId = 0;transactionId < block["body"].length;transactionId++){
            block["body"].push(this.getTransaction(transactionId));
        }

        return block;
    }

    getNextHashes = (blockHash) => {
        var collection = db.collection('blockchain');
        var cursor = collection.find({"blockhash": blockHash});
        if(cursor.length < 1){
            return []
        }

        return cursor[0].nextHashes;
    }

    getBlockchain = () => {
        var blockchain = {}
        blockchain['genesisHash'] = this.genesisHash;
        this.genesisBlock = this.getBlock(this.genesisHash);
        blockchain[this.genesisHash] = { block: this.genesisBlock, nextHashes: this.getNextHashes(this.genesisHash) };
        var hashesToCheck = []
        hashesToCheck.push(...this.getNextHashes(this.genesisHash));
        var toAdd = null;
        while(true){
            if(hashesToCheck.length == 0){
                break;
            }
            toAdd = hashesToCheck.shift();
            blockchain[toAdd] = { block: this.getBlock(toAdd), nextHashes: this.getNextHashes(toAdd) };
            hashesToCheck.push(...this.getNextHashes(toAdd));
        }

        return blockchain;
    }



}