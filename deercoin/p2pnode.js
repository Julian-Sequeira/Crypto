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
const request = require('request-promise');

const PORT = process.env.PORT || 8085;
const hostname = os.hostname();
// Array to store our connections
let sockets = [];

if(hostname !== 'dh2020pc28'){
    request('http://dh2020pc28:8085/peers')
    .then(function (peers) {
        console.log(peers);
    })
    .catch(function (err) {
        // Crawling failed...
    });
    // const socket = ioClient('http://dh2020pc28:8085');
    // console.log("connecting");
    // sockets.push(socket);
    // socket.on('connect', function () {
    //     // socket connected
    //     socket.emit('handshake', { hostname, PORT });
    // });
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
        console.log(`handshake from ${data.hostname}`);
        const address = `http://${data.hostname}:${data.PORT}`;
        peerAddresses.set(data.hostname, address);
    });
    socket.on('transaction', function(transaction){
        console.log(transaction);
    });
    socket.on('disconnect', function(){
        // add
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

app.post('/transaction', (req, res) => {
    transaction = req.body;
    sockets.forEach((socket)=>{
        socket.emit("transaction",transaction);
    });
    io.emit('broadcast', transaction);
    res.send(transaction);
});

// TODO: Use env var
server.listen(PORT, () =>
    console.log(`Example app listening on port ${PORT}!`),
);
