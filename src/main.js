const initHttpServer = require('./node/httpServer');
const { initP2PServer, connectToPeers, initialPeers } = require('./node/p2pServer');

connectToPeers(initialPeers);
initHttpServer();
initP2PServer();
