const initHttpServer = require('./node/httpServer');
const { initP2PServer, connectToPeers, initialPeers } = require('./node/p2pServer');
const BlockChain = require('./node/blockChain').BlockChain;

const blockchain = new BlockChain();

connectToPeers(initialPeers);
initHttpServer(blockchain);
initP2PServer(blockchain);
