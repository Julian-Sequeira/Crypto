'use strict';
var CryptoJS = require("crypto");
var express = require("express");
var bodyParser = require('body-parser');
var WebSocket = require("ws");
var genesisBlock = require("./genesisBlock.json");

const Transaction = require('./cli-wallet/transaction.js');

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

var sockets = [];
var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

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
blockchain['genesis'] = genesisBlock;
const genesisHash = getBlockHash(genesisBlock);
blockchain[genesisHash] = [genesisBlock];
blockchain['longest'] = genesisBlock; //stores the leaf node of the longest chain

var memPool = [];//use priority queo

var initHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());

    app.get('/allBlocks', (req, res) => res.send(blockchain));
    app.get('/lastBlock', (req, res) => res.send(blockchain['longest']));
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
        console.log(req.body.newBlock);
        addBlock(req.body.newBlock);
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
    var current_block = blockchain['longest'];
    while(current_block != blockchain['genesis']){
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
    // if(newBlock.header.preHash in blockchain){//check to see if this branch exist at all
    //     if (isValidNewBlock(newBlock, blockchain[newBlock.header.preHash][0])) {
            // blockchain[newBlock.header.preHash].push(newBlock);
            const newBlockHash = getBlockHash(newBlock); // TODO
            blockchain[newBlockHash] = [newBlock];
            //check to see if the new block is the most work done branch of blockchain
            //if so, assign that as the longest
            // if (checkMostWork(newBlock)){
                blockchain["longest"]= newBlock;
            // }
    //     }
    // }
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
    return suggestedThickestBranch.work > blockchain['longest'].work;
}

/*
find the branch(leaf node) that contains the most work in the given blockchain
*/
var findThickestBranch = (blockchain) => {
    var thickestBranch = blockchain['genesis'];
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

var getLatestBlock = () => blockchain['longest'];
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
