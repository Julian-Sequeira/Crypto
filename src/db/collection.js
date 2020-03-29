const genesisBlock = require("../genesisBlock.json");
const { getBlockHash } = require('../shared/utils.js');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/Deercoin';

/*
    const genesisHash = getBlockHash(genesisBlock);
    this.blockchain = {};
    this.blockchain['genesisHash'] = genesisHash;
    this.blockchain[genesisHash] = { block: genesisBlock, nextHashes: [] };
    this.blockchain['longestHash'] = genesisHash; //stores the leaf node of the longest chain
    this.latestBlock = genesisBlock;
*/

MongoClient.connect(url, function (err, client) {
    if (err) throw err;
    var db = client.db('Deercoin');    
    const genesisHash = getBlockHash(genesisBlock); 
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
                blockhash: "genesisHash",
                nextHashes: [genesisHash]
            },
            {
                blockhash: "longestHash",
                nextHashes: [genesisHash]
            },
            {
                blockhash: "",
                nextHashes: []
            }

        ]);
        return result;
    }).then(function(result) {

        //creating new collections
        db.createCollection("blocks", function (err, res) {
            if (err) throw err;
            console.log("blocks collection created!");
            db.collection('blocks').insertOne({
                hash: genesisHash,
                block: genesisBlock
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
        db.createCollection("mempool", function (err, res) {
            if (err) throw err;
            console.log("mempool collection created!");
            return result;
        });

    }).then(function(result) {
        client.close();
    })
});