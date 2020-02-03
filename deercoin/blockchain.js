//https://www.npmjs.com/package/js-sha256
var sha256 = require('js-sha256');

class Block{
  constructor(index, hash, previousHash, timestamp, data){
      this.index = index;
      this.previousHash = previousHash;
      this.timestamp  = timestamp;
      this.data = data;
      this.hash = hash;
  }
}

class Blockchain {
    constructor() {
      this.chain = [];
      this.genesisBlock = new Block(0 , '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', null, 1465154705, 'my genesis block!!');
      this.chain.push(this.genesisBlock);
    }

    /*
    *calculated the hash of the a block using js-sha256 package from npm
    */
    calculateHash(index, previousHash, timestamp, data){
      return sha256(index + previousHash + timestamp + data);
    }

    /*
    *adds new block to the chain
    */
    addBlockToChain(block){
      this.chain.push(block);
    }

    printChain(){
      for(var i = 0;i<this.chain.length;i++){
        console.log(this.chain[i]);
        if(i != this.chain.length-1){
          console.log("                |");
          console.log("                |");
          console.log("                |");
          console.log("                v");
        }
      }
    }

    /*
    * returns the last block in the current chain
    */
    getLatestBlock(){
      return this.chain.slice(-1).pop();
    }

    generateNextBlock(blockData){
      var previousBlock = this.getLatestBlock();
      var nextIndex = previousBlock.index + 1;
      var nextTimestamp = new Date().getTime() / 1000;
      var nextHash = this.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
      var newBlock = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
      this.addBlockToChain(newBlock);
    }

    /* NOT TESTED
    * returns the correct hash of new block(pending to be added to the chain)
    */
    calculateHashForBlock(newBlock){
      var previousBlock = this.getLatestBlock();
      var index = previousBlock.index + 1;
      var timestamp = newBlock.timestamp;
      var previousHash = previousBlock.hash;
      var blockData = newBlock.data;

      return this.calculateHash(index, previousHash, timestamp, blockData);
    }


    /* NOT TESTED
    * checks the validity of a block
    * For a block to be valid the following must apply:
    *     The index of the block must be one number larger than the previous
    *     The previousHash of the block match the hash of the previous block
    *     The hash of the block itself must be valid
    */
    isValidNewBlock(newBlock, previousBlock){
      if(previousBlock.index + 1 !== newBlock.index){
        console.log('invalid index');
        return false;
      }else if(previousBlock.hash !== newBlock.previousHash){
        console.log('invalid previoushash');
        return false;
      }else if(this.calculateHashForBlock(newBlock) !== newBlock.hash){
        console.log('invalid hash');
        return false;
      }
      return true;

    }
  }

  module.exports.blockchain = Blockchain;
  module.exports.block = Block;