//import Block from "./Block";
const master = require('./blockchain');

deerChain = new master.blockchain();
var nb_index = 3 ;
var nb_previousHash = 'a0b32242fe7921f1620a3dcefa961edc64f45d73b9ccb0e2d96aed1bc22eafba';
var nb_hash = '0b28a19d8aa27f925330cfc1babd734aa5e7b67839f9dbdf15d7fc8fbc10f426';
var nb_timestamp = 1580688252.655;
var nb_data = 'alex was here';
nb = new master.block(3, nb_hash, nb_previousHash, nb_timestamp, nb_data);
console.log(nb);

deerChain.generateNextBlock("sina was here");
deerChain.generateNextBlock("eva was here");
deerChain.generateNextBlock("alex was here");
deerChain.printChain();