import React, { Component } from 'react';
import Tree from 'react-d3-tree';
import axios from 'axios';
import crypto from 'crypto';
import { shorten } from './utils.js';
import BlockPage from './blockPage.js';
import _ from 'lodash';
import { getBlockHash } from '../shared/utils.js';

function treeDataRec(blockchain, curHash, index){
  const blockData = blockchain[curHash];
  const parentBlock = blockData.block;
  const parentBlockHash = getBlockHash(parentBlock);
  const treeData = {
      name: index.toString(),
      attributes: {
        hash: shorten(parentBlockHash, 4)
      },
      children: [],
      hash: parentBlockHash
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
    treeData: [{name: '0'}]
  }

  async componentDidMount(){
    this.refresh();
  }

  refresh = async () => {
    // console.log('refreshing blockchain');
    let blockchain;
    try{
      blockchain = (await axios.get('http://localhost:3001/allBlocks')).data;
    }
    catch (e) {
      console.log(e);
    }
    if (blockchain !== undefined & !_.isEqual(blockchain, this.state.blockchain)) {
      const treeData = blockchainToTreeData(blockchain)
      this.setState({treeData, blockchain});
    }
    setTimeout(this.refresh, 5000);
  }

  clickHandler = (blockData) => {
    const { setOverlayComponent } = this.props;
    const { blockchain } = this.state;
    const comp = <BlockPage block={blockchain[blockData.hash]} hash={blockData.hash} setOverlayComponent={setOverlayComponent} />;
    setOverlayComponent(comp, blockData.hash);
  }

  render() {
    return (
      <div className="blockTree">
        <Tree 
          data={this.state.treeData} 
          translate={{x: 100, y: 200}} 
          nodeSize={{x: 200, y:100}}
          onClick={this.clickHandler}
          collapsible={false}
        />
      </div>
    );
  }
}

export default BlockTree;