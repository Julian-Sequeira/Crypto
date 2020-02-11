// Node module imports
const express = require("express");
const bodyParser = require('body-parser');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
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

io.on('connection', function(socket){
    console.log('a node connected');
    socket.on('newBlock',function(block){
        console.log('user disconnected');
    });
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });

// HTTP API
let initialHTTPServer = (port) => {

    // Set up JSON parsing
    const app = express();
    app.use(bodyParser.json());

    // Get the blockchain here
    app.get('/blockchain', (req, res) => {
        res.send(deerchain.getChain());
    });

    // mine new blocks
    app.post('/mineBlock',(req,res)=>{
        var minedBlock = generateNextBlock(req.body.data);
        io.emit('newBlock',minedBlock);
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