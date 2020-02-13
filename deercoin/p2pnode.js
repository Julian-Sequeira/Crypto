// Node module imports
const express = require("express");
const bodyParser = require('body-parser');
const WebSocket = require("ws");
const uuidv4 = require('uuid/v4');
// import uuidv4 from 'uuid/v4';

// Ports
const http_port = 8001;
const p2p_port = 8002;

// Array to store our connections
let sockets = [];

// Temp storage for peers. {unique id, peer}
// TODO: add inital peers to map
let map = new Map();

// HTTP API
const initialHTTPServer = () => {

    // Set up JSON parsing
    const app = express();
    app.use(bodyParser.json());

    // Default route
    app.get('/', (req, res) => {
        res.send("hello world");
    });

    // Get the blockchain here
    app.get('/blockchain', (req, res) => {
        res.send("get blockchain");
    })

    app.get('/peers', (req, res) => {
        console.log("get peers");
        const peers = Array.from(map.values());

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
        map.set(id, host.concat(':', port));

        const node = `http://${host}:${port}`;
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
    app.listen(8085, () =>
        console.log(`Example app listening on port ${process.env.PORT}!`),
    );
}

initialHTTPServer();