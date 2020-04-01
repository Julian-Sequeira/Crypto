const initHttpServer = require('./node/httpServer');
const { initP2PServer } = require('./node/p2pServer');
const BlockChain = require('./node/blockChain').BlockChain;
const os = require('os');

const blockchain = new BlockChain();

initHttpServer(blockchain);
initP2PServer(blockchain, os.hostname());
