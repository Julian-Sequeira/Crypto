// Node module imports
// require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
// Set up JSON parsing
const app = express();
app.use(bodyParser.json());
// const WebSocket = require("ws");
const uuidv4 = require('uuid/v4');
// import uuidv4 from 'uuid/v4';
const server = require('http').Server(app);
const io = require('socket.io')(server);
const ioClient = require('socket.io-client');
const master = require('./blockchain');
const fileIO = require('./fileIO');
const os = require('os');

const PORT = process.env.PORT || 8085;
const hostname = os.hostname();

if(hostname !== 'dh2010pc44'){
    const socket = ioClient('dh2010pc44');
    console.log("connecting");
    socket.on('connect', function () {
        // socket connected
        console.log('connected');
        socket.emit('handshake', { address: `hostname:${PORT}` });
    });
}

file = new fileIO.fileIO();
deerChain = new master.blockchain();

if(file.doesExist()){
    data = file.readIO();
    deerChain.setChain(data['chain']);
}

// Ports
const http_port = 8001;
const p2p_port = 8002;

// Array to store our connections
let sockets = [];

// Temp storage for peers. {unique id, peer}
// TODO: add inital peers to map
let peerAddresses = new Map();

io.on('connection', function(socket){
    console.log('a node connected');
    socket.on('newBlock',function(block){
        if(deerchain.isValidNewBlock(block, deerchain.getLatestBlock())){
            deerchain.addBlockToChain(block);
        }
    });
    socket.on('handshake', function(data){
        console.log(`handshake from ${data.address}`);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

// Default route
app.get('/', (req, res) => {
    res.send("hello world");
});

// Get the blockchain here
app.get('/blockchain', (req, res) => {
    res.send(deercoin.getChain());
})

app.get('/peers', (req, res) => {
    console.log("get peers");
    const peers = Array.from(peerAddresses.values());

    const message = {
        peers,
    };

    res.send(message);
});

app.post('/addPeer', (req, res) => {
    // uuidv4 generrates a unique identifier
    const id = uuidv4();
    let host = req.body.host;
    let port = req.body.port;

    const node = `http://${host}:${port}`;
    peerAddresses.set(id, node);
    // Add this node to socket

    const message = {
        id,
        host,
        port,
    };

    res.send(message);
});

app.post('/mine', (req, res) => {
    console.log("mine block");
});

// TODO: Use env var
server.listen(PORT, () =>
    console.log(`Example app listening on port ${PORT}!`),
);
