// Easy path management
require('module-alias/register');

// Node modules
const genesisBlock = require("../generate/blocks/genesisBlock.json");
// const sqlite3 = require("sqlite3").verbose();

// Custom modules
// const memory = require("../db/collection.js");
const { getBlockHash, getHash } = require('@shared/utils.js');


/**
 * The object in memory where each node will store its copy of the blockchain
 */
class BlockChain {
    constructor() {
        // set up database
        const genesisHash = getBlockHash(genesisBlock);
        this.blockchain = {};
        this.blockchain['genesisHash'] = genesisHash;
        this.blockchain[genesisHash] = { block: genesisBlock, totalDifficulty: 1, nextHashes: [] };
        this.blockchain['longestChain'] = genesisHash; //stores the leaf node of the longest chain
        this.latestBlock = genesisBlock;
        this.difficulty = 1; // The current difficulty needed to create a new block
        this.longestDifficulty = 1; // The difficulty sum of all the blocks in the longest chain
        this.numBlocks = 1;
        this.updatedTime = Date.now();
        this.memPool = {}; 
    }

    /** Getters */
    getLatestBlock = () => this.latestBlock;
    getBlockChain = () => this.blockchain;
    getDB = () => db;
    getMempool = () => this.memPool;
    getBlock = (hash) => this.blockchain[hash];

    /**
     * Update the difficulty needed to create a new block
     * Want a new block roughly every minute
     * So increase or decrease the difficulty depending on how fast the last 10 blocks were added
     * To keep things simple we just increase or decrease by 1 depending
     */
    updateDifficulty = () => {
        if (numBlocks % 10 == 0) {
            const currentTime = Date.now();
            const elapsed = currentTime - this.updatedTime;
            const seconds = parseInt(Math.floor(elapsed/1000));
            const minutes = parseInt(Math.floor(seconds/60));
            if (minutes > 10) {
                this.difficulty++;
            } else if (minutes < 10) {
                this.difficulty--;
            }
            this.updatedTime = currentTime;
        }
    }

    /**
     * Check if a block is valid or not, meaning:
     * 1) The block's content's hash matches the listed hash and the difficulty
     * 2) The prevHash matches the hash header of the previous block
     * 3) All transactions within the block are valid (TO DO)
     */
    isValidBlock = (newBlock) => {

        // Check the block's content's hash
        const contentHash = getHash(newBlock.body);
        if (contentHash != newBlock.header.currHash) return false;

        // Check the block's difficulty
        const blockDifficulty = newBlock.header.difficulty;
        if (blockDifficulty != this.difficulty) return false;
        for (let i = 0; i < blockDifficulty; i++) {
            if (contentHash[i] != '0') {
                return false;
            }
        }

        // Check the hash header of the previous block
        const prevHash = newBlock.header.prevHash;
        if (!(prevHash in this.blockchain)) return false;
        const prevBlock = this.blockchain[prevHash];
        if (getBlockHash(prevBlock) != prevHash) return false;

        // Verify all transactions within the block (TO DO)
    }

    /** 
     * Add a new block to the branch it's meant to go on
     * Add the difficulty of the newest block to the difficulty of the chain it's on
     * If it's greater than the longest chain then you have a new longest chain
     */
    addBlockToBranch = (newBlock) => {

        // Calculate the total difficulty of the updated branch
        let branchHash = newBlock.header.prevHash;
        let branchDifficulty = this.blockchain[branchHash].totalDifficulty;
        branchDifficulty += newBlock.header.difficulty;

        // Add the block to the blockchain
        this.latestBlock = newBlock;
        const newBlockHash = getBlockHash(newBlock);
        this.blockchain[branchHash].nextHashes.push(newBlockHash);
        this.blockchain[newBlockHash] = { 
            block: newBlock, 
            totalDifficulty: branchDifficulty,
            nextHashes: [] 
        }

        // Update the longest chain
        if (chainDifficulty > this.longestDifficulty) {
            this.longestDifficulty = chainDifficulty;
            this.blockchain['longestChain'] = newBlockHash;
        }
    }

    /** 
     * Accept a new block onto the blockchain
     */
    addBlock = (newBlock) => {
        // Verify the block, and make sure it adheres to the current difficulty
        if (isValidBlock(newBlock) && (newBlock.header.difficulty == this.difficulty)) {
            console.log('Adding block to the chain');
            this.addBlockToBranch(newBlock);
            this.numBlocks++;
            this.updateDifficulty();
            return;
        } else {
            console.log('New block is invalid and not accepted');
        } 
    }

    /** 
     * Verify the whole blockchain
     * Essentially just validate each block in the chain 
     * */
    validateChain = () => {
        Object.keys(this.blockchain).forEach(key => {
            let block = this.blockchain[key];
            if (key == this.blockchain['genesisHash']) {
                if (block != genesisBlock) return false;
            } else {
                if (!this.isValidBlock(block)) return false;
            }
        })
    }

    replaceChain = (newChain) => {
        this.blockchain = newChain;
        this.latestBlock = this.blockchain[this.blockchain['longestChain']].block;
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
            current_block = this.blockchain[current_block.header.prevHash];
        }
        return false;
    }

    /*
        get the list of the longest chain starting with the most recent block
    */
    findLongestChain = () => {
        const longestChain = [];
        let current_hash = this.blockchain['longestChain'];
        do {
            longestChain.push(this.blockchain[current_hash]);
            current_hash = this.blockchain[current_hash].header.prevHash;
        } while (current_hash != this.blockchain['genesisHash']);
        return longestChain;
    }
}

/*
checks to see if the new block is valid
*/
const isValidNewBlock = (newBlock, previousBlock) => {
//     // if (previousBlock.index + 1 !== newBlock.index) {//checks if newBlock's index is one more than the previous
//     //         console.log('invalid index');
//     //         return false;
//     // }else if(previousBlock.difficulty + 1 !== newBlock.difficulty){//checks if newBlock's difficulty is one more than the previous
//     //         console.log('invalid difficulty');
//     //         return false;
//     // }else if(previousBlock.work + newBlock.difficulty !== newBlock.work){//checks if newBlock's work makes sense
//     //         console.log('invalid work');
//     //         return false;
//     // }else
    if (getBlockHash(previousBlock) !== newBlock.header.prevHash) {//checks if newBlock's previous hash is the previousBlock's hash
        // TODO: check difficulty and transactions
        console.log('invalid previoushash');
        return false;
    }
    return true;
};



module.exports = { BlockChain, isValidNewBlock };
