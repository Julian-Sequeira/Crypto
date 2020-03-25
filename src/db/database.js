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



}