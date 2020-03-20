const WebSocket = require("ws");
const os = require('os');

const p2p_port = process.env.P2P_PORT || 6001;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const sockets = [];
let peers = [];
const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2,
    QUERY_PEERS: 3,
    RESPONSE_PEERS: 4,
    QUERY_MEMPOOL: 5,
    RESPONSE_MEMPOOL: 6,
    INFO_PEER: 7,
    INFO_PEER_BROADCAST: 8,
    INFO_NEW_BLOCK: 9
};

let blockchain;

const initP2PServer = (chain, hostname) => {
    blockchain = chain;
    const server = new WebSocket.Server({ port: p2p_port });
    server.on('connection', ws => initConnection(ws));
    console.log('listening websocket p2p port on: ' + p2p_port);
    connectToPeers(initialPeers, hostname);
};

const connectToPeers = (newPeers, hostname) => {
    newPeers.forEach((peer) => {
        const ws = new WebSocket(peer);
        ws.on('open', () => { initConnection(ws); requestState(ws, hostname) });
        ws.on('error', () => {
            console.log('connection failed')
        });
    });
    peers = peers.concat(newPeers);
};

const initConnection = (ws) => {
    sockets.push(ws);
    // peers.push(ws._socket.remoteAddress + ':' + ws._socket.remotePort);
    initMessageHandler(ws);
    initErrorHandler(ws);
};

const requestState = (ws, hostname) => {
    write(ws, queryAllMsg()); // get blockChain on connection
    write(ws, queryPeersMsg()); // get peer list on connection
    write(ws, queryMemPoolMsg()); // get peer list on connection
    write(ws, infoPeerMsg(hostname + ':' + p2p_port)); // send hostname to new peer
}

const initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        const message = JSON.parse(data);
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
            case MessageType.QUERY_PEERS:
                write(ws, responsePeersMsg());
                break;
            case MessageType.RESPONSE_PEERS:
                handlePeersResponse(message);
                break;
            case MessageType.QUERY_MEMPOOL:
                write(ws, responseMemPoolMsg());
                break;
            case MessageType.RESPONSE_MEMPOOL:
                handleMemPoolResponse(message);
                break;
            case MessageType.INFO_PEER_BROADCAST:
                handlePeerInfo(message, true);
                break;
            case MessageType.INFO_PEER:
                handlePeerInfo(message, false);
                break;
            case MessageType.INFO_NEW_BLOCK:
                handleNewBlock(message);
                break;
        }
    });
};

const initErrorHandler = (ws) => {
    const closeConnection = (ws) => {
        console.log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

const handlePeerInfo = (message, shouldBroadcast) => {
    console.log('added peer');
    const peer = JSON.parse(message.data);
    if (peer != `${os.hostname()}:${p2p_port}`) {
        peers.push(peer);
    }
    if (shouldBroadcast) {
        broadcast(infoPeerQuietMsg(peer));
    }
}

const handlePeersResponse = (message) => {
    console.log('received peer list');
    const newPeers = JSON.parse(message.data);
    peers = peers.concat(newPeers);
}

const handleMemPoolResponse = (message) => {
    console.log('received mempool');
    const newMempool = JSON.parse(message.data);
    blockchain.replaceMempool(newMempool);
}

const handleNewBlock = (message) => {
    console.log('got new block message');
    const newBlock = JSON.parse(message.data);
    blockchain.addBlock(newBlock);
}

const handleBlockchainResponse = (message) => {
    console.log('got new block message');
    const receivedChain = JSON.parse(message.data);
    blockchain.replaceChain(receivedChain);
    // const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    // const latestBlockHeld = blockchain.getLatestBlock();
    // if (latestBlockReceived.index > latestBlockHeld.index) {
    //     console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
    //     if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
    //         console.log("We can append the received block to our chain");
    //         blockchain.addBlock(latestBlockReceived)
    //         broadcast(responseLatestMsg());
    //     } else if (receivedBlocks.length === 1) {
    //         console.log("We have to query the chain from our peer");
    //         broadcast(queryAllMsg());
    //     } else {
    //         console.log("Received blockchain is longer than current blockchain");
    //         replaceChain(receivedBlocks);
    //     }
    // } else {
    //     console.log('received blockchain is not longer than current blockchain. Do nothing');
    // }
};

var queryChainLengthMsg = () => ({ 'type': MessageType.QUERY_LATEST });
var queryPeersMsg = () => ({ 'type': MessageType.QUERY_PEERS });
var queryMemPoolMsg = () => ({ 'type': MessageType.QUERY_MEMPOOL });
var queryAllMsg = () => ({ 'type': MessageType.QUERY_ALL });
var infoPeerMsg = (peer) => ({ 
    'type': MessageType.INFO_PEER_BROADCAST,
    'data': JSON.stringify(peer)
});
var infoPeerQuietMsg = (peer) => ({ 
    'type': MessageType.INFO_PEER,
    'data': JSON.stringify(peer)
});
var responseChainMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockchain.getBlockChain())
});
var responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify(blockchain.getLatestBlock())
});
var newBlockMsg = (newBlock) => ({
    'type': MessageType.INFO_NEW_BLOCK,
    'data': JSON.stringify(newBlock)
});
var responsePeersMsg = () => ({
    'type': MessageType.RESPONSE_PEERS,
    'data': JSON.stringify(peers)
});
var responseMemPoolMsg = () => ({
    'type': MessageType.RESPONSE_MEMPOOL,
    'data': JSON.stringify(blockchain.getMempool())
});

var getPeers = () => peers;
var write = (ws, message) => ws.send(JSON.stringify(message));
var broadcast = (message) => sockets.forEach(socket => write(socket, message));

module.exports = { initP2PServer, newBlockMsg, responseLatestMsg, connectToPeers, broadcast, getPeers };