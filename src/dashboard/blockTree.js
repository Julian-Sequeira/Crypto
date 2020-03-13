import React, { Component } from 'react';
import Tree from 'react-d3-tree';
import axios from 'axios';
import crypto from 'crypto';
 
const myTreeData = [
  {
    name: 'Top Level',
    attributes: {
      keyA: 'val A',
      keyB: 'val B',
      keyC: 'val C',
    },
    children: [
      {
        name: 'Level 2: A',
        attributes: {
          keyA: 'val A',
          keyB: 'val B',
          keyC: 'val C',
        },
      },
      {
        name: 'Level 2: A',
        attributes: {
          keyA: 'val A',
          keyB: 'val B',
          keyC: 'val C',
        },
      },
    ],
  },
];

// function getRandomBlocks(n){
//   const blocks = [];
//   for (let i = 0; i < n; i++){
//     let hash = crypto.SHA1("qwertyuiop" + i).toString();
//     blocks.push({index: i, data: "TRANSACTION DATA HERE", hash: hash});
//   }
//   return blocks;
// }

function getBlockHash(block) {
  return crypto.createHash('sha256').update(JSON.stringify(block.header)).digest('HEX');
}

function treeDataRec(blockchain, curHash, index){
  const blockData = blockchain[curHash];
  const parentBlock = blockData.block;
  const parentBlockHash = getBlockHash(parentBlock);
  const treeData = {
      name: index.toString(),
      attributes: {
        hash: parentBlockHash.substring(0, 4) + '...' 
              + parentBlockHash.substring(parentBlockHash.length-4)
      },
      children: []
  }
  blockData.nextHashes.forEach((hash) => {
    const child = treeDataRec(blockchain, hash, index+1);
    treeData.children.push(child);
  });
  return treeData;
}

function blockchainToTreeData(blockchain){
  const genesisHash = blockchain.genesisHash;
  const treeData = [ treeDataRec(blockchain, genesisHash, 0) ];
  return treeData;
}

class BlockTree extends Component {

  state = {
    blockchain: null,
    treeData: myTreeData
  }

  async componentDidMount(){
    let blockchain;
    try{
      blockchain = (await axios.get('http://localhost:3001/allBlocks')).data;
    }
    catch (e) {
      console.log(e);
    }
    if (blockchain !== undefined) {
      const treeData = blockchainToTreeData(blockchain)
      this.setState({treeData});
    }
  }

  render() {
    return (
      <div className="blockTree">
        <Tree 
          data={this.state.treeData} 
          translate={{x: 100, y: 200}} 
          nodeSize={{x: 200, y:100}}
        />
      </div>
    );
  }
}

export default BlockTree;