import React, { Component } from 'react';
import Tree from 'react-d3-tree';
import axios from 'axios';
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
        hash: parentBlockHash
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

function getHashString(hash) {
  const comp = 
  <div>
    <div>
      {hash.substring(0,14)}
    </div>
    <div>
      {hash.substring(14,28)}
    </div>
    <div className="leftABit">
      ...
    </div>
    <div>
      {hash.substring(hash.length - 14, hash.length)}
    </div>
  </div>
  return comp;
}

class NodeLabel extends React.PureComponent {
  render() {
    const {className, nodeData} = this.props
    return (
      <div className={className}>
        {nodeData.hash ? getHashString(nodeData.hash) : ''}
      </div>
    )
  }
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
    const svgSquare = {
      shape: 'rect',
      shapeProps: {
        fill: 'rgba(0, 0, 0, 0)',
        width: 120,
        height: 120,
        x: -5,
        y: 0,
      }
    }
    return (
      <div className="blockTree">
        <Tree 
          data={this.state.treeData} 
          translate={{x: 100, y: 200}} 
          nodeSize={{x: 250, y: 200}}
          onClick={this.clickHandler}
          collapsible={false}
          nodeSvgShape={svgSquare}
          allowForeignObjects
          nodeLabelComponent={{
            render: <NodeLabel className='blockLabel' />,
            foreignObjectWrapper: {
              y: 24
            }
          }}
        />
      </div>
    );
  }
}

export default BlockTree;