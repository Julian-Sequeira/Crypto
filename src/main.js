const initHttpServer = require('./node/httpServer');
const { initP2PServer } = require('./node/p2pServer');
const BlockChain = require('./node/blockChain').BlockChain;
const os = require('os');
const ngrok = require('ngrok');

const blockchain = new BlockChain();

initHttpServer(blockchain);
initP2PServer(blockchain, os.hostname());

(async function() {
  const url = await ngrok.connect(3001);
  console.log(url);
})();
