const WebSocket = require("ws");

const p2p_port = process.env.P2P_PORT || 6001;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const sockets = [];
const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

const initP2PServer = () => {
  const server = new WebSocket.Server({port: p2p_port});
  server.on('connection', ws => initConnection(ws));
  console.log('listening websocket p2p port on: ' + p2p_port);
};

const connectToPeers = (newPeers) => {
  newPeers.forEach((peer) => {
      const ws = new WebSocket(peer);
      ws.on('open', () => initConnection(ws));
      ws.on('error', () => {
          console.log('connection failed')
      });
  });
};

const initConnection = (ws) => {
  sockets.push(ws);
  initMessageHandler(ws);
  initErrorHandler(ws);
  write(ws, queryChainLengthMsg());
};

const initMessageHandler = (ws) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data);
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

const initErrorHandler = (ws) => {
  const closeConnection = (ws) => {
      console.log('connection failed to peer: ' + ws.url);
      sockets.splice(sockets.indexOf(ws), 1);
  };
  ws.on('close', () => closeConnection(ws));
  ws.on('error', () => closeConnection(ws));
};

const handleBlockchainResponse = (message) => {
  const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
  const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
  const latestBlockHeld = getLatestBlock();
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

module.exports = { initP2PServer, connectToPeers, initialPeers };