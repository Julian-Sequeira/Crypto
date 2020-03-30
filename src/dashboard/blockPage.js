import React, { Component } from 'react';
import axios from 'axios';

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
  
  render() {
    const { blockInfo, hash } = this.state;
    const block = blockInfo ? blockInfo.block : null;
    return (
      <div className="block">
        {
          blockInfo === undefined ? `block with hash '${hash}' not found` :
          <div>
            Block hash: {hash}
            <br />
            timestamp: {block.header.timestamp}
          </div>
        }
      </div>
    );
  }
}

export default BlockPage;
