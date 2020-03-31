const CryptoJS = require("crypto");

function getBlockHash(block) {
  return CryptoJS.createHash('sha256').update(JSON.stringify(block.header)).digest('HEX');
}

function getHash(data) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

module.exports = { getBlockHash, getHash };
