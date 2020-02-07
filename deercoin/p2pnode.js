// Node module imports
const express = require("express");
const bodyParser = require('body-parser');
const WebSocket = require("ws");

// Ports
const http_port = 8001;
const p2p_port = 8002;

// Array to store our connections
let sockets = [];

// HTTP API
let initialHTTPServer = () => {

    // Set up JSON parsing
    const app = express();
    app.use(bodyParser.json());

    // Get the blockchain here
    app.get('/blockchain', (req, res) => {
        // I'm too fucking tired for this
    })
}