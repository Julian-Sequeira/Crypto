const CryptoJS = require("crypto");

function getBlockHash(block) {
  return CryptoJS.createHash('sha256').update(JSON.stringify(block.header)).digest('HEX');
}

module.exports = { getBlockHash };