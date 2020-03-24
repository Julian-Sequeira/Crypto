
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/Deercoin';


MongoClient.connect(url, function (err, client) {
    if (err) throw err;
    var db = client.db('Deercoin');     
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
                blockhash: "genesis",
                children: ["521ae34d0f1bd452103724aa8e53e6793da6fc581adeeac3f13a31fb94272437"]
            },
            {
                blockhash: "longest",
                children: ["521ae34d0f1bd452103724aa8e53e6793da6fc581adeeac3f13a31fb94272437"]
            }

        ]);
        return result;
    }).then(function(result) {

        //creating new collections
        db.createCollection("blocks", function (err, res) {
            if (err) throw err;
            console.log("blocks collection created!");
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
        client.close();
    })
});