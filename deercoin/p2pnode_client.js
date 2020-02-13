// Node module imports
const express = require("express");
const bodyParser = require('body-parser');
var socket = require('socket.io')('http://localhost');
const master = require('./blockchain');
const fileIO = require('./fileIO');

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

//socket.on('connect', function(){});
//socket.on('event', function(data){});
//socket.on('disconnect', function(){});
socket.on('blockchian', function(blockchain){
    deerchain.setChain(blockchain);
});

// HTTP API
let initialHTTPServer = (port) => {

    // Set up JSON parsing
    const app = express();
    app.use(bodyParser.json());

    // mine new blocks
    app.post('/mineBlock',(req,res)=>{
        var minedBlock = generateNextBlock(req.body.data);
        socket.emit('newBlock',minedBlock);
    });
    /*
    // get all the nodes
    app.get('/peers',(req,res)=>{

    });

    // add new node to our network
    app.post('/addPeer',(req,res)=>{

    });
    */
    app.listen(port, ()=>{
        console.log('Listening http on port: ' + port);
    });
}