const genesisBlock = require("../genesisBlock.json");
const sqlite3 = require("sqlite3").verbose();

const { getBlockHash } = require('../shared/utils.js');

// set up database
var db = new sqlite3.Database(":memory:", (err) => {
	if (err) {
		console.log(err.message);
	}
	console.log("Connected to the database.");
});

//our blockchain is more like a tree. It will keep track of all the children
const blockchain = {};
const genesisHash = getBlockHash(genesisBlock);
blockchain['genesisHash'] = genesisHash;
blockchain[genesisHash] = { block: genesisBlock, nextHashes: []};
blockchain['longestHash'] = genesisHash; //stores the leaf node of the longest chain
let latestBlock = genesisBlock;

const memPool = [];//use priority queo

/*
adds the block to the longest branch of the blockchain
*/
const addBlock = (newBlock) => {
  if(newBlock.header.preHash in blockchain){//check to see if this branch exist at all
      if (isValidNewBlock(newBlock, blockchain[newBlock.header.preHash].block)) {
          const newBlockHash = getBlockHash(newBlock); // TODO
          blockchain[newBlock.header.preHash].nextHashes.push(newBlockHash);
          blockchain[newBlockHash] = {block: newBlock, nextHashes: []};
          blockchain['longestHash'] = newBlockHash;
          latestBlock = newBlock;
          //check to see if the new block is the most work done branch of blockchain
          //if so, assign that as the longest
          // if (checkMostWork(newBlock)){
              // blockchain["longest"]= newBlock;
          // }
      }
  }
};

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

/*
replaces the blockchain with the one that contains more work and its valid
*/
const replaceChain = (newBlocks) => {
  if (isValidChain(newBlocks) && HasMoreWork(newBlocks)) {
      console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
      blockchain = newBlocks;
      broadcast(responseLatestMsg());
  } else {
      console.log('Received blockchain invalid');
  }
};

/*
checks the validity of any chain
it mainly loops through all branches and uses isValidNewBlock to test its validity
*/
const isValidChain = (blockchainToValidate) => {
  if (JSON.stringify(blockchainToValidate['genesis']) !== JSON.stringify(genesisBlock)) {
      return false;
  }

  var toCheck = [genesisBlock];
  while (toCheck.length > 0){//loop through every branch
      var blockToCheck = toCheck[0];
      var ChildrenList = blockchain[getBlockHash(blockToCheck)];
      for(var i = 1;i<ChildrenList.length; i++){//loop through everychild
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
};

/*
checks if the given blockchain has more work than the one we already have
*/
const HasMoreWork = (blockchain) => {
  const suggestedThickestBranch = findThickestBranch(blockchain);
  return suggestedThickestBranch.work > latestBlock.work;
}

/*
    checks to see if one chain is a sublist of another.
*/
var isInLongest = (hash) => {
  var current_block = latestBlock;
  while(current_block != genesisBlock){
      if(blockchain[hash] == current_block){
          return current_block;
      }
      current_block = blockchain[current_block.header.preHash];
  }
  return false;
}

/*
find the branch(leaf node) that contains the most work in the given blockchain
*/
const findThickestBranch = (blockchain) => {
  const thickestBranch = genesisBlock;
  const toCheck = [thickestBranch];
  while (toCheck.length > 0){//loop through every branch
    const blockToCheck = toCheck[0];
    const ChildrenList = blockchain[getBlockHash(blockToCheck)];
      for(let i = 1;i<ChildrenList.length; i++){//loop through everychild
          if (thickestBranch.work < ChildrenList[i].work) {
              thickestBranch = ChildrenList[i];
          }
          toCheck.push(ChildrenList[i]);
      }
      //the parent block that was fully checked shall be removed
      toCheck.shift();
  }
  return thickestBranch;
}

const getLatestBlock = () => latestBlock;


module.exports = { getLatestBlock, addBlock, isInLongest, db, memPool }