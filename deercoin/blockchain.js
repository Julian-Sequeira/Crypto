class Blockchain {
    constructor(brand) {
      this.chain = [];
      this.genesisBlock = new Block(0 , '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', null, 1465154705, 'my genesis block!!');
    }

    /*
    *calculated the hash of the a block using js-sha256 package from npm
    */
    calculateHash(index, previousHash, timestamp, data){
      return sha256(index + previousHash + timestamp + data);
    }

    /*
    * returns the last block in the current chain
    */
    getLatestBlock(){
      return this.chain.slice(-1).pop();
    }

    generateNextBlock(blockData){
      previousBlock = getLatestBlock();
      nextIndex = previousBlock.index + 1;
      nextTimestamp = new Date().getTime() / 1000;
      nextHahs = this.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
      newBlock = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
    }

    /*
    * returns the correct hash of new block(pending to be added to the chain)
    */
    calculateHashForBlock(newBlock){
      previousBlock = getLatestBlock();
      index = previousBlock.index + 1;
      timestamp = newBlock.timestamp;
      previousHash = previousBlock.hash;
      blockData = newBlock.data;

      return this.calculateHash(index, previousHash, timestamp, blockData);
    }


    /*
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