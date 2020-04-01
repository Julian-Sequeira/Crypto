const genesisBlock = require("../genesisBlock.json");
// const memory = require("../db/collection.js");
// const sqlite3 = require("sqlite3").verbose();

const { getBlockHash } = require('../shared/utils.js');

class BlockChain {
  constructor() {
    // set up database
    const genesisHash = getBlockHash(genesisBlock);
    this.blockchain = {};
    this.blockchain['genesisHash'] = genesisHash;
    this.blockchain[genesisHash] = { block: genesisBlock, nextHashes: [] };
    this.blockchain['longestHash'] = genesisHash; //stores the leaf node of the longest chain
    this.latestBlock = genesisBlock;
    this.memPool = {}; 
  }

  getLatestBlock = () => this.latestBlock;
  getBlockChain = () => this.blockchain;
  getDB = () => db;
  getMempool = () => this.memPool;
  getBlock = (hash) => this.blockchain[hash];

  addBlock = (newBlock) => {
    if (newBlock.header.preHash in this.blockchain) {//check to see if this branch exist at all
      if (isValidNewBlock(newBlock, this.blockchain[newBlock.header.preHash].block)) {
        console.log('adding block');
        const newBlockHash = getBlockHash(newBlock); // TODO
        this.blockchain[newBlock.header.preHash].nextHashes.push(newBlockHash);
        this.blockchain[newBlockHash] = { block: newBlock, nextHashes: [] };
        this.blockchain['longestHash'] = newBlockHash;
        this.latestBlock = newBlock;
        //check to see if the new block is the most work done branch of blockchain
        //if so, assign that as the longest
        // if (checkMostWork(newBlock)){
        // this.blockchain["longest"]= newBlock;
        // }
        return;
      }
    }
    console.log('new block is invalid');
  }

  replaceChain = (newChain) => {
    this.blockchain = newChain;
    this.latestBlock = this.blockchain[this.blockchain['longestHash']].block;
  }

  replaceMempool = (newMempool) => {
    this.memPool = newMempool;
  }

  isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate['genesis']) !== JSON.stringify(genesisBlock)) {
      return false;
    }

    var toCheck = [genesisBlock];
    while (toCheck.length > 0) {//loop through every branch
      var blockToCheck = toCheck[0];
      var ChildrenList = this.blockchain[getBlockHash(blockToCheck)];
      for (var i = 1; i < ChildrenList.length; i++) {//loop through everychild
        if (isValidNewBlock(ChildrenList[i], blockToCheck)) {
          toCheck.push(ChildrenList[i]);//if valid, add the branch to list to further check
        } else {
          return false;
        }
      }
      //the parent block that was fully checked shall be removed
      toCheck.shift();
    }
    return true;
  }

  isInLongest = (hash) => {
    var current_block = this.latestBlock;
    while (current_block != genesisBlock) {
      if (this.blockchain[hash] == current_block) {
        return current_block;
      }
      current_block = this.blockchain[current_block.header.preHash];
    }
    return false;
  }

  /*
    get the list of the longest chain starting with the most recent block
  */
  findLongestChain = () => {
    const longestChain = [];
    let current_hash = this.blockchain['longestHash'];
    do {
      longestChain.push(this.blockchain[current_hash]);
      current_hash = this.blockchain[current_hash].header.preHash;
    } while (current_hash != this.blockchain['genesisHash']);
    return longestChain;
  }
}

/*
checks to see if the new block is valid
*/
const isValidNewBlock = (newBlock, previousBlock) => {
  // if (previousBlock.index + 1 !== newBlock.index) {//checks if newBlock's index is one more than the previous
  //     console.log('invalid index');
  //     return false;
  // }else if(previousBlock.difficulty + 1 !== newBlock.difficulty){//checks if newBlock's difficulty is one more than the previous
  //     console.log('invalid difficulty');
  //     return false;
  // }else if(previousBlock.work + newBlock.difficulty !== newBlock.work){//checks if newBlock's work makes sense
  //     console.log('invalid work');
  //     return false;
  // }else
  if (getBlockHash(previousBlock) !== newBlock.header.preHash) {//checks if newBlock's previous hash is the previousBlock's hash
    // TODO: check difficulty and transactions
    console.log('invalid previoushash');
    return false;
  }
  return true;
};



module.exports = { BlockChain, isValidNewBlock };
