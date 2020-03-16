const keygen = require('./keygen.js');
const createSignature = require('./create_signature.js');
const verifySignature = require('./verify_signature.js');
const loadKeyPair = require('./load_keys.js');

module.exports = { keygen, createSignature, verifySignature, loadKeyPair }