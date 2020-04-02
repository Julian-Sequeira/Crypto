import React, { Component } from 'react';
import axios from 'axios';
import Transaction from './transaction.js';

class BlockPage extends Component {

  constructor (props) {
    super(props);

    const hash = props.match ? props.match.params.hash : props.hash;

    this.state = {
      blockInfo: props.block,
      hash: hash
    }
  }

  async componentDidMount(){
    if (this.state.block === undefined) {
      let blockData;
      const { hash } = this.state;
      try{
        blockData = (await axios.get(`http://localhost:3001/block?hash=${hash}`)).data;
      }
      catch (e) {
        console.log(e);
      }
      if (blockData !== undefined) {
        this.setState({ blockInfo: blockData.block });
      }
    }
  }

  getTransactionComps = (transactions) => {
    const { setOverlayComponent } = this.props;
    const comps = [];
    transactions.forEach((transaction) => {
      comps.push(<Transaction transaction={transaction} key={transaction.id} setOverlayComponent={setOverlayComponent} />);
      comps.push(<br key={transaction.id + 'br'} />);
    })
    return comps;
  }
  
  render() {
    const { blockInfo, hash } = this.state;
    const block = blockInfo ? blockInfo.block : null;
    const comps = block ? this.getTransactionComps(block.body) : '';
    console.log(block);
    return (
      <div className="blockPage">
        {
          blockInfo === undefined ? `block with hash '${hash}' not found` :
          <div>
            block hash: {hash} <br />
            previous block's hash: {block.header.preHash} <br /><br /><br />
            transactions: <br /><br />
            {comps}
            <br />
            Details: <br /><br />
            timestamp: {block.header.timestamp} <br />
            hash of transactions: {block.header.currHash} <br />
            difficulty: {block.header.difficulty} <br />
            nonce: {block.header.nonce} 
          </div>
        }
      </div>
    );
  }
}

export default BlockPage;
