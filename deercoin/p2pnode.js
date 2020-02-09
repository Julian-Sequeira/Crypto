// Node module imports
const express = require("express");
const bodyParser = require('body-parser');
const WebSocket = require("ws");
import uuidv4 from 'uuid/v4';

// Ports
const http_port = 8001;
const p2p_port = 8002;

// Array to store our connections
let sockets = [];

// Temp storage for peers. {unique id, peer}
let map = new Map();

// HTTP API
const initialHTTPServer = () => {

    // Set up JSON parsing
    const app = express();
    app.use(bodyParser.json());

    // Default route
    app.get('/', (req, res) => {
        console.log("hello world");
    });

    // Get the blockchain here
    app.get('/blockchain', (req, res) => {
        console.log("get blockchain");
    })

    app.get('peers', (req, res) => {
        console.log("get peers");
        peerArray = Array.from(map.values());
        res.send(peerArray);
    });

    app.post('addPeer', (req, res) => {
        // uuidv4 generrates a unique identifier
        const id = uuidv4();
        const peer = req.body.peer;
        map.set(id, peer);

        const message = {
            id,
            peer,
        };

        message[id] = id;
        message[peer] = peer;

        res.send(message);
    });

    app.post('mine', (req, res) => {
        console.log("mine block");
    });

    app.listen(process.env.PORT, () =>
        console.log(`Example app listening on port ${process.env.PORT}!`),
    );
}