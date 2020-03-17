'use strict';
var CryptoJS = require("crypto");
var express = require("express");
var cors = require('cors');
var bodyParser = require('body-parser');
var WebSocket = require("ws");
var genesisBlock = require("./genesisBlock.json");

const Transaction = require('./cli-wallet/transaction.js');
const sqlite3 = require("sqlite3").verbose();

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

var sockets = [];
var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};


// set up database
var db = new sqlite3.Database(":memory:", (err) => {
	if (err) {
		console.log(err.message);
	}
	console.log("Connected to the database.");
});

function getBlockHash(block) {
    return CryptoJS.createHash('sha256').update(JSON.stringify(block.header)).digest('HEX');
}

function validateTransaction(transaction) {
    // TODO: check if signing is correct
    // for (const block of blockchain) {
    //     for (const confTransaction of block.body) {
    //         if (confTransaction.details.previousID == transaction.details.previousID){
    //             return false;
    //         }
    //         if (confTransaction.id == transaction.details.previousID
    //             && confTransaction.details.amount == transaction.details.amount){
    //             return true;
    //         }
    //     }
    // }
    return true;
}

//our blockchain is more like a tree. It will keep track of all the children
var blockchain = {};
const genesisHash = getBlockHash(genesisBlock);
blockchain['genesisHash'] = genesisHash;
blockchain[genesisHash] = { block: genesisBlock, nextHashes: []};
blockchain['longestHash'] = genesisHash; //stores the leaf node of the longest chain
let latestBlock = genesisBlock;

var memPool = [{
    "details": {
       "publicKey": "2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0a4d494943496a414e42676b71686b6947397730424151454641414f43416738414d49494343674b4341674541327339764d7a6f7553536a596d43354337645a530a38756f564c654a4e383330587253776a6749727a3457453332357a3737503246494a30532b44394e534f7459353046346749686a3859305432526c73336945450a6a627a5a65774b51682f2b7a4f31386e7866654e536f2f454652616b344879383444317a4b63316555586461635251475a64625476495a495a6d47734c4e57630a6645745863686b5a755133366651696231476b6a4349614f4967436553754370334c727874367a3657524e6b70412b38704d352f70354558434e344c6e30626d0a41724f5353686275444878596972374938706861373638584663794241652f765946496278785a5a6f43364d4f52423073546a6a4a6369595359506d43657a780a556d557234564558703039656231756d4454727875314931366b4e503567423939312b366c7052436e366351636a46464b6e5a552b4a534c4a4b7169374e4c450a3931366e7a2f386369684131594263676837554f627262744d3537364c304250554a4a6d777963656a67636e4c6a50634a614f4d6131795764626a3042596f630a654c75434e45567043424a396d4367456c747a5563773559617876626d6268794f623455785665737273446959486e6978716b555a356f515a616868414862630a715038756c38756a7569794a72453369756d4e3265714a4134715a466d355274446e6273466f566948705938657444424761694b59346f515644313573412f660a52697842662b644f635a69524b59366832334353586a2b636b4e534e394e5a745a69356c463931615a6264456273784f693248624c5471547a4659337068557a0a35544c62556561374d446a6962464c636651445865634c4d5634646e317432306c74764c577343573472376b46534b6a755831466b50755a494d337930736d4b0a516a62633174482f5974456733464337536b4d2f496d45434177454141513d3d0a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d0a",
       "previousID": 0,
       "previousIdx": 0,
       "fee": 0.05,
       "recipients": [
          {
             "index": "0",
             "address": "2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0a4d494943496a414e42676b71686b6947397730424151454641414f43416738414d49494343674b4341674541705254616a4c6a77375366676c4868584c6343340a48314e6f694137304f324d7a57504d4d6550396c554c49584e7635594e45464259394b6d3664463061627879586a4276626239714978556e51326e62776f37360a7374697538724c6778615261446b744771304f746a2f34515a4d5644652f364943547051514e3534354d6c3464315137396a47584e712f43472f6b3033575a750a6a33646174654c4a4468617658336b2f556e64797165624a37586b48795371486a6d6f6c426e6349432b514c535a4e3230494f4237693531364e336f303773450a724971544c416f4a5362796c464e343058383954594561664f64746245386c3375366c69575369415458356233725a59574f614f2b616b5153634f43374452460a6a776c6e617930724956705275522f733636526e6f6c54556d32347042714d625876437a3148322f2b6d56376c4632754e636d4b476446394d5467347a6259350a535050396e6b356e5938452b4a382b346e534c35444a6c372f34424151354d3449704632574e61794f427a765374725752584b667a2f4647414377763235502f0a72392b724447616a327a395768764975374632564135436f624734327264436a6e30424e583676635057504e5164696f5679724e6d4b4b484e4431456a696f690a7955736b5a6a6d66596f4a5653744b554b6e746b6c3366455278504c44335a2b395a4d6b42455a5a5037457a5351696d414b723739674169706d566c7256396d0a4d7533324161352f4a363379326c35725965456333514169504358797651334f574c554643474574763749446631795154614864773954763231724c676b684b0a666f59696f6358426c6b373676445a7042376431486e432f5642347857325856485870595169445a546471424b4c46643364707a68705a336653394653574a590a50374b6f6a5a2b51614f2f5851744f5869394b5a615a4d434177454141513d3d0a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d0a",
             "amount": 100
          }
       ]
    },
    "id": "bedcb54e8355c86cfac9af198bca34cb9c333d3763e0a20dfd9351b754c2bb11",
    "signature": "91f4c8af5c82e77a595bf7384c0b0a280c7fccba865bdf4b13314cdb9ad7b39aa783bc2922a34f434f26a1e5b9484fa5c39d89e2e1d77cfc1f2daa70a1dc200a32873abb5a76cad292cdd98f345134cfb22461f26375cbd6c53a99b9c81116059b46a9f71a2e4e2efc80dc56407e9453fc85a067993fe9754b52894cc8fb87a0c57b0f4c39aced11ad9979a6a69240505303e33e6d9d25c507fb12b0091f2831a8d8ef828dfbd1734751c28ead3fa237371ad350fc33e2ea41cc398eb945c71ee24cfe1bc7ad80c6df6b37be4fa38d90bb7287f361ecf5fdf27ed03966240c86be2f66d41ea7d18a042c456530a55f0ec0158837d6125c808bbbac02bd34f837b77fce6ef2201aef51f085bc12f8240bc55c9f56a640b1ea1543906b81ebc1b7448f8e67d2ac0ba7ede6250f3fc6464f1bfe224fcba24daf11bb632d6f5eb6589d117f1a0791560c5de8d98a3aac0453be6f53001f9478fd2e6c26ea4160beb7f4c82d5be73da975fcc836e00f3c09f3d9a24982d715e52a7de1a2862f6a1c598c2b0f11b5ffb4ca34c7ee9b91923fd9f8c9caa2bce15c991b565ebb03a16be9e8285f766a19e37154927a6a4bebc59ac35fc501a7358693c9eb79a7ae0c308e0c4ba669d23579aa3b5b15b062921025784654d4d39e57ad74e0d57a33b715908ee93cf0d9297383afa274517c49af5c756d78b8a33aba8e9b4c1e7fae946a90"
 },{
    "details": {
       "publicKey": "2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0a4d494943496a414e42676b71686b6947397730424151454641414f43416738414d49494343674b4341674541327339764d7a6f7553536a596d43354337645a530a38756f564c654a4e383330587253776a6749727a3457453332357a3737503246494a30532b44394e534f7459353046346749686a3859305432526c73336945450a6a627a5a65774b51682f2b7a4f31386e7866654e536f2f454652616b344879383444317a4b63316555586461635251475a64625476495a495a6d47734c4e57630a6645745863686b5a755133366651696231476b6a4349614f4967436553754370334c727874367a3657524e6b70412b38704d352f70354558434e344c6e30626d0a41724f5353686275444878596972374938706861373638584663794241652f765946496278785a5a6f43364d4f52423073546a6a4a6369595359506d43657a780a556d557234564558703039656231756d4454727875314931366b4e503567423939312b366c7052436e366351636a46464b6e5a552b4a534c4a4b7169374e4c450a3931366e7a2f386369684131594263676837554f627262744d3537364c304250554a4a6d777963656a67636e4c6a50634a614f4d6131795764626a3042596f630a654c75434e45567043424a396d4367456c747a5563773559617876626d6268794f623455785665737273446959486e6978716b555a356f515a616868414862630a715038756c38756a7569794a72453369756d4e3265714a4134715a466d355274446e6273466f566948705938657444424761694b59346f515644313573412f660a52697842662b644f635a69524b59366832334353586a2b636b4e534e394e5a745a69356c463931615a6264456273784f693248624c5471547a4659337068557a0a35544c62556561374d446a6962464c636651445865634c4d5634646e317432306c74764c577343573472376b46534b6a755831466b50755a494d337930736d4b0a516a62633174482f5974456733464337536b4d2f496d45434177454141513d3d0a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d0a",
       "previousID": 0,
       "previousIdx": 0,
       "fee": 0.05,
       "recipients": [
          {
             "index": "0",
             "address": "2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0a4d494943496a414e42676b71686b6947397730424151454641414f43416738414d49494343674b4341674541705254616a4c6a77375366676c4868584c6343340a48314e6f694137304f324d7a57504d4d6550396c554c49584e7635594e45464259394b6d3664463061627879586a4276626239714978556e51326e62776f37360a7374697538724c6778615261446b744771304f746a2f34515a4d5644652f364943547051514e3534354d6c3464315137396a47584e712f43472f6b3033575a750a6a33646174654c4a4468617658336b2f556e64797165624a37586b48795371486a6d6f6c426e6349432b514c535a4e3230494f4237693531364e336f303773450a724971544c416f4a5362796c464e343058383954594561664f64746245386c3375366c69575369415458356233725a59574f614f2b616b5153634f43374452460a6a776c6e617930724956705275522f733636526e6f6c54556d32347042714d625876437a3148322f2b6d56376c4632754e636d4b476446394d5467347a6259350a535050396e6b356e5938452b4a382b346e534c35444a6c372f34424151354d3449704632574e61794f427a765374725752584b667a2f4647414377763235502f0a72392b724447616a327a395768764975374632564135436f624734327264436a6e30424e583676635057504e5164696f5679724e6d4b4b484e4431456a696f690a7955736b5a6a6d66596f4a5653744b554b6e746b6c3366455278504c44335a2b395a4d6b42455a5a5037457a5351696d414b723739674169706d566c7256396d0a4d7533324161352f4a363379326c35725965456333514169504358797651334f574c554643474574763749446631795154614864773954763231724c676b684b0a666f59696f6358426c6b373676445a7042376431486e432f5642347857325856485870595169445a546471424b4c46643364707a68705a336653394653574a590a50374b6f6a5a2b51614f2f5851744f5869394b5a615a4d434177454141513d3d0a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d0a",
             "amount": 100
          }
       ]
    },
    "id": "bedcb54e8355c86cfac9af198bca34cb9c333d3763e0a20dfd9351b754c2bb11",
    "signature": "91f4c8af5c82e77a595bf7384c0b0a280c7fccba865bdf4b13314cdb9ad7b39aa783bc2922a34f434f26a1e5b9484fa5c39d89e2e1d77cfc1f2daa70a1dc200a32873abb5a76cad292cdd98f345134cfb22461f26375cbd6c53a99b9c81116059b46a9f71a2e4e2efc80dc56407e9453fc85a067993fe9754b52894cc8fb87a0c57b0f4c39aced11ad9979a6a69240505303e33e6d9d25c507fb12b0091f2831a8d8ef828dfbd1734751c28ead3fa237371ad350fc33e2ea41cc398eb945c71ee24cfe1bc7ad80c6df6b37be4fa38d90bb7287f361ecf5fdf27ed03966240c86be2f66d41ea7d18a042c456530a55f0ec0158837d6125c808bbbac02bd34f837b77fce6ef2201aef51f085bc12f8240bc55c9f56a640b1ea1543906b81ebc1b7448f8e67d2ac0ba7ede6250f3fc6464f1bfe224fcba24daf11bb632d6f5eb6589d117f1a0791560c5de8d98a3aac0453be6f53001f9478fd2e6c26ea4160beb7f4c82d5be73da975fcc836e00f3c09f3d9a24982d715e52a7de1a2862f6a1c598c2b0f11b5ffb4ca34c7ee9b91923fd9f8c9caa2bce15c991b565ebb03a16be9e8285f766a19e37154927a6a4bebc59ac35fc501a7358693c9eb79a7ae0c308e0c4ba669d23579aa3b5b15b062921025784654d4d39e57ad74e0d57a33b715908ee93cf0d9297383afa274517c49af5c756d78b8a33aba8e9b4c1e7fae946a90"
 }];//use priority queo

var initHttpServer = () => {
    var app = express();
    app.use(cors());
    app.use(bodyParser.json());

    app.get('/allBlocks', (req, res) => {
        var blockchain;
        let sql = 'SELECT * FROM blockchain;';
        db.all(sql, [], (err, rows) => {
            if (err) { // error
                res.status(400);
                blockchain = err.message;
            } else if (rows.length === 0) { // no highscores
                res.status(404);
                blockchain = "No BlockChain!";
            } else {
                res.status(200);
                blockchain = rows;
            }
            res.send(blockchain);
        });
        
    });
    app.get('/lastBlock', (req, res) => {
        var longest;
        let sql = 'SELECT * FROM block WHERE blockhash = '
        sql += '(SELECT child FROM blockchain WHERE blockhash = longest);';
        db.all(sql, [], (err, rows) => {
            if (err) { // error
                res.status(400);
                longest = err.message;
            } else if (rows.length === 0) { // no highscores
                res.status(404);
                longest = "No BlockChain!";
            } else {
                res.status(200);
                longest = rows;
            }
            res.send(longest);
        });
    });

    app.get('/getNewBlocks', (req,res) => {
        var blockHash = req.body.hash;
        var foundBlock = null;
        if(foundBlock = isInLongest(blockHash)){
            res.send(JSON.stringify(cutBlockchain(foundBlock)));
        }else{

        }
    });
    app.post('/addBlock', (req, res) => {
        console.log('got new block');
        // console.log(req.body.newBlock);
        addBlock(req.body.newBlock);
        // insert into blocks
        new Promise(function(resolve, reject) {
            let sql = 'INSERT INTO block(blockhash, prehash, difficulty, nonce, timestamp) ';
            sql += 'VALUES(?, ?, ?, ?, ?);';
            db.get(sql, [req.body.newBlock.header.currHash, req.body.newBlock.header.preHash, req.body.newBlock.header.difficulty, req.body.newBlock.header.nonce, req.body.newBlock.header.timestamp], (err, row) => {
                if (err) {
                    // error
                    res.status(404);
                    var result = err.message;
                    res.json(result);
                    reject(err.message);
                }else{
                    resolve(1);
                }
            });

        }).then(function(result) { // (**)
        
            let sql = 'INSERT INTO blockchain(blockhash, child) ';
            sql += 'VALUES(?, ?);';
            db.get(sql, [req.body.newBlock.header.currHash, req.body.newBlock.header.preHash], (err, row) => {
                if (err) {
                    // error
                    res.status(404);
                    var result = err.message;
                    res.json(result);
                    reject(err.message);
                }else{
                    resolve(1);
                }
            });

        });
        broadcast(responseLatestMsg());
        res.send();
    });
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });
    app.get('/transactions', (req, res) => res.send(JSON.stringify(memPool)));
    // Get a transaction from a wallet or another node
    app.post('/addTransaction', (req, res) => {
        // console.log(req.body.trxData);
        // TODO: check if trans is valid
        // const transaction = JSON.parse(req.body.trxData);
        // const isValidTransaction = validateTransaction(transaction);
        // if (isValidTransaction) {
        //     memPool.push(transaction);
        //     res.status(200);
        //     res.send({msg: "Transaction received"});
        // } else {
        //     res.status(400);
        //     res.send({msg: "Transaction rejected"});
        // }

        console.log(req.body.trxData);
        let transaction = new Transaction(JSON.parse(req.body.trxData));
        memPool.push(transaction);
        console.log(memPool);
        res.status(200);
        res.send();
    });
    app.post('/getBalance', (req, res) => {
        // get balance of a wallet user
        let balance = 0
        const address = req.body.address;
        const transactions = getTransactions(address);
        transactions.forEach((transaction) => {
            if (transaction.sender === address) {
                balance -= transaction.amount;
            } else if (transaction.recipient === address) {
                balance += transaction.amount;
            } else {
                console.log('encountered unknown sender/recipient');
            }
        })
        res.status(200).send({ balance });
    });
    app.post('/getTransactions', (req, res) => {
        // get transactions of a wallet user
        const address = req.body.address;
        const transactions = getTransactions(address);
        res.status(200).send({ transactions });
    });

    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};

const getTransactions = (address) => {
    const transactions = [];
    let currBlock = findThickestBranch(blockchain);
    let preHash = currBlock.header.preHash;
    while (true) {
        // go through all transactions in currBlock
        currBlock.body.forEach((transaction) => {
            // sending money
            if (transaction.details.publicKey === address) {
                transaction.details.recipients.forEach((recipient) => {
                    if (recipient.address === address) {
                        return;
                    }
                    transactions.push({
                        sender: address,
                        recipient: recipient.address,
                        amount: recipient.amount,
                        date: new Date(currBlock.header.timestamp * 1000)
                    });
                });
                return;
            }
            // receiving money
            transaction.details.recipients.forEach((recipient) => {
                if (recipient.address === address) {
                    transactions.push({
                        sender: transaction.details.publicKey,
                        recipient: address,
                        amount: recipient.amount,
                        date: new Date(currBlock.header.timestamp * 1000)
                    });
                }
            });
        });
        if (preHash in blockchain === false) break;
        currBlock = blockchain[preHash];
        preHash = currBlock.preHash;
    }
    return transactions;
};

/*
    checks to see if one chain is a sublist of another.
*/
var isInLongest = (hash) => {
    var current_block = latestBlock;
    while(current_block != genesisBlock){
        if(blockchain[hash] == current_block){
            return current_block;
        }
        current_block = blockchain[current_block.header.preHash];
    }
    return false;
}

var cutBlockchain = (foundBlock) => {
    var cutted_blockchain = {};

}

var initP2PServer = () => {
    var server = new WebSocket.Server({port: p2p_port});
    server.on('connection', ws => initConnection(ws));
    console.log('listening websocket p2p port on: ' + p2p_port);

};

var initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

var initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        var message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

var initErrorHandler = (ws) => {
    var closeConnection = (ws) => {
        console.log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

/*
Given the blockData, it will create a new block and add it to the longest branch
*/
// var generateNextBlock = (blockData) => {
//     var previousBlock = getLatestBlock();
//     var nextIndex = previousBlock.index + 1;
//     var nextDifficulty = previousBlock.difficulty + 1;
//     var nextWork = previousBlock.work + nextDifficulty;
//     var nextTimestamp = new Date().getTime() / 1000;
//     var nextNonce = getNonceForDifficultry(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextDifficulty, nextWork);
//     var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextDifficulty, nextWork ,nextNonce);
//     return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash, nextDifficulty, nextWork, nextNonce);
// };

// /*
// Returns a nonce value that can give us a hash with certain difficulty
//  */
// var getNonceForDifficultry = (index, previousHash, timestamp, data, difficulty, work) => {
//     var newHash = null;
//     var nonce = -1;
//     do{
//         nonce += 1;//adds one to the nonce everytime the hash difficulty is not correct
//         newHash = calculateHash(index, previousHash, timestamp, data, difficulty, work, nonce);
//     } while (!checkHashFormat(newHash, difficulty));//checks hash difficulty
//     return nonce;
// }


// /*
// returns a hash for the given block given its attributes
// This function is used for check the hash validity of a block
// */
// var calculateHashForBlock = (block) => {
//     return calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.work, block.nonce);
// };

// /*
// Checks if the hash has certain difficulty
// By difficulty, we mean the number of zeroes at the beginning of the hash
// For example, a hash with difficulty 2 must have a format 00xxxxxxxxx
// */
// var checkHashFormat = (hash, difficulty) => {
//     var regex = RegExp(`^[0]{${difficulty}}.+`,"i");
//     return regex.test(hash);
// };


// /*
// calculates hash of a block given all its attributes
// */
// var calculateHash = (index, previousHash, timestamp, data, difficulty, work, nonce) => {
//     return CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + work + nonce).toString();
// };

// /*
// checks if a block has more work than the current longest
// */
// var checkMostWork = (newBlock) => {
//     return longest.work < newBlock.work;
// }

/*
adds the block to the longest branch of the blockchain
*/
var addBlock = (newBlock) => {
    if(newBlock.header.preHash in blockchain){//check to see if this branch exist at all
        if (isValidNewBlock(newBlock, blockchain[newBlock.header.preHash].block)) {
            const newBlockHash = getBlockHash(newBlock); // TODO
            blockchain[newBlock.header.preHash].nextHashes.push(newBlockHash);
            blockchain[newBlockHash] = {block: newBlock, nextHashes: []};
            blockchain['longestHash'] = newBlockHash;
            latestBlock = newBlock;
            //check to see if the new block is the most work done branch of blockchain
            //if so, assign that as the longest
            // if (checkMostWork(newBlock)){
                // blockchain["longest"]= newBlock;
            // }
        }
    }
};

/*
checks to see if the new block is valid
*/
var isValidNewBlock = (newBlock, previousBlock) => {
    // if (previousBlock.index + 1 !== newBlock.index) {//checks if newBlock's index is one more than the previous
    //     console.log('invalid index');
    //     return false;
    // }else if(previousBlock.difficulty + 1 !== newBlock.difficulty){//checks if newBlock's difficulty is one more than the previous
    //     console.log('invalid difficulty');
    //     return false;
    // }else if(previousBlock.work + newBlock.difficulty !== newBlock.work){//checks if newBlock's work makes sense
    //     console.log('invalid work');
    //     return false;
    // }else
    if (getBlockHash(previousBlock) !== newBlock.header.preHash) {//checks if newBlock's previous hash is the previousBlock's hash
        // TODO: check difficulty and transactions
        console.log('invalid previoushash');
        return false;
    }
    return true;
};

var connectToPeers = (newPeers) => {
    newPeers.forEach((peer) => {
        var ws = new WebSocket(peer);
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            console.log('connection failed')
        });
    });
};

var handleBlockchainResponse = (message) => {
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received block to our chain");
            addBlock(latestBlockReceived)
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than current blockchain. Do nothing');
    }
};

/*
replaces the blockchain with the one that contains more work and its valid
*/
var replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && HasMoreWork(newBlocks)) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('Received blockchain invalid');
    }
};

/*
checks the validity of any chain
it mainly loops through all branches and uses isValidNewBlock to test its validity
*/
var isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate['genesis']) !== JSON.stringify(genesisBlock)) {
        return false;
    }

    var toCheck = [genesisBlock];
    while (toCheck.length > 0){//loop through every branch
        var blockToCheck = toCheck[0];
        var ChildrenList = blockchain[getBlockHash(blockToCheck)];
        for(var i = 1;i<ChildrenList.length; i++){//loop through everychild
            if (isValidNewBlock(ChildrenList[i], blockToCheck)) {
                toCheck.push(ChildrenList[i]);//if valid, add the branch to list to further check
            } else {
                return false;
            }
        }
        //the parent block that was fully checked shall be removed
        toCheck.shift();
    }
    return true;
};

/*
checks if the given blockchain has more work than the one we already have
*/
var HasMoreWork = (blockchain) => {
    var suggestedThickestBranch = findThickestBranch(blockchain);
    return suggestedThickestBranch.work > latestBlock.work;
}

/*
find the branch(leaf node) that contains the most work in the given blockchain
*/
var findThickestBranch = (blockchain) => {
    var thickestBranch = genesisBlock;
    var toCheck = [thickestBranch];
    while (toCheck.length > 0){//loop through every branch
        var blockToCheck = toCheck[0];
        var ChildrenList = blockchain[getBlockHash(blockToCheck)];
        for(var i = 1;i<ChildrenList.length; i++){//loop through everychild
            if (thickestBranch.work < ChildrenList[i].work) {
                thickestBranch = ChildrenList[i];
            }
            toCheck.push(ChildrenList[i]);
        }
        //the parent block that was fully checked shall be removed
        toCheck.shift();
    }
    return thickestBranch;
}

var getLatestBlock = () => latestBlock;
var queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});
var queryAllMsg = () => ({'type': MessageType.QUERY_ALL});
var responseChainMsg = () =>({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockchain)
});
var responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
});

var write = (ws, message) => ws.send(JSON.stringify(message));
var broadcast = (message) => sockets.forEach(socket => write(socket, message));

connectToPeers(initialPeers);
initHttpServer();
initP2PServer();

//----------------------------------------------testing area
/*
var newBlock = generateNextBlock('sina was here');
addBlock(newBlock);
newBlock = generateNextBlock('sina was here 2');
addBlock(newBlock);
console.log("-------------------");
console.log(findThickestBranch(blockchain));
*/
