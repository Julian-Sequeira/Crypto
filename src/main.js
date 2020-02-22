'use strict';
var CryptoJS = require("crypto-js");
var express = require("express");
var bodyParser = require('body-parser');
var WebSocket = require("ws");

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];
//TODO: calculate hash for block

class Block {
    constructor(index, previousHash, timestamp, data, hash, difficulty, work) {
        this.work = work; //stores the total work of the branch upto the current block
        this.difficulty = difficulty;
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
        this.nonce = 0;
    }
}

var sockets = [];
var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

var getGenesisBlock = () => {
    return new Block(0, "0", 1465154705, "my genesis block!!", "016534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7", 1, 1);
};

var blockchain = [getGenesisBlock()];

//our blockchain is more like a tree. It will keep track of all the children
var blockchain2 = new Object();
blockchain2['genesis'] = getGenesisBlock();
blockchain2[(getGenesisBlock()).hash] = [(getGenesisBlock())];

var longest = (getGenesisBlock());//stores the leaf node of the longest chain

var initHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain2)));
    app.post('/mineBlock', (req, res) => {
        var newBlock = generateNextBlock(req.body.data);
        addBlock(newBlock);
        broadcast(responseLatestMsg());
        console.log('block added: ' + JSON.stringify(newBlock));
        res.send();
    });
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};


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


var generateNextBlock = (blockData) => {
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextDifficulty = previousBlock.difficulty + 1;
    var nextWork = previousBlock.work + nextDifficulty;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash, nextDifficulty, nextWork);
};


var calculateHashForBlock = (block) => {
    var newHash = null;

    do{
        block.nonce += 1;
        newHash = calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.work, block.nonce);
    } while (!checkHashFormat(newHash, block.difficulty));
    
    return newHash;
};

var checkHashFormat = (hash, difficulty) => {
    var regex = RegExp(`[0]{${difficulty}}.*`,"g");
    return regex.test(hash);
};


var calculateHash = (index, previousHash, timestamp, data, difficulty, work, nonce) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + work + nonce).toString();
};

var checkMostWork = (newBlock) => {
    return longest.work < newBlock.work;
}

var addBlock = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        if(newBlock.previousHash in blockchain2){//check to see if this branch exist at all
            newBlock.work += newBlock.work + blockchain2[newBlock.previousHash][0].difficulty;
            blockchain2[newBlock.previousHash].push(newBlock);
            blockchain2[newBlock.hash] = [newBlock];
            //check to see if the new block is the most work done branch of blockchain
            //if so, assign that as the longest
            if (checkMostWork(newBlock)){
                longest = newBlock;
            }
        }
    }
};

var isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    }else if(previousBlock.difficulty + 1 !== newBlock.difficulty){
        console.log('invalid difficulty');
        return false;
    }else if(previousBlock.work + newBlock.difficulty !== newBlock.work){
        console.log('invalid work');
        return false;
    }else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
        console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
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

var replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && HasMoreWork(newBlocks)) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('Received blockchain invalid');
    }
};

var isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate['genesis']) !== JSON.stringify(getGenesisBlock())) {
        return false;
    }

    var toCheck = [getGenesisBlock()];
    while (toCheck.length > 0){//loop through every branch
        var blockToCheck = toCheck[0];
        var ChildrenList = blockchain2[blockToCheck.hash];
        for(var i = 1;i<ChildrenList.length; i++){//loop through everychild
            if (isValidNewBlock(ChildrenList[i], blockToCheck)) {
                toCheck.push(ChildrenList[i]);
            } else {
                return false;
            }
        }
        //the parent block that was fully checked shall be removed
        toCheck.shift();
    }
    return true;

};

var HasMoreWork = (blockchain) => {
    var suggestedThickestBranch = findThickestBranch(blockchain);
    return suggestedThickestBranch.work > longest.work;
}

var findThickestBranch = (blockchain) => {
    var thickestBranch = blockchain['genesis'];
    var toCheck = [thickestBranch];
    while (toCheck.length > 0){//loop through every branch
        var blockToCheck = toCheck[0];
        var ChildrenList = blockchain[blockToCheck.hash];
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

//var getLatestBlock = () => blockchain[blockchain.length - 1];
var getLatestBlock = () => longest;
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
/* */
console.log(blockchain2);