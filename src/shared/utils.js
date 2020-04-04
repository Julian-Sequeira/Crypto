const CryptoJS = require("crypto");



function getHash(data) {
  const hash = CryptoJS.createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

function getBlockHash(block) {
    return getHash(block.header);
  }

module.exports = { getBlockHash, getHash };
