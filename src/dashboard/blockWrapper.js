import React, { Component } from 'react';
import Block from './block.js';

class BlockWrapper extends Component {

  createBlocks = (blocks) => {
    const comps = [];
    blocks.forEach((block) => {
      comps.push(<Block block={block} key={block.hash} />);
    });
    return comps
  }

  render() {
    const { blocks } = this.props;
    return (
      <div className="blockWrapper">
        {this.createBlocks(blocks)}
      </div>
    );
  }
}

export default BlockWrapper;