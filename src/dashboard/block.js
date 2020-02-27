import React, { Component } from 'react';

class Block extends Component {

  render() {
    const { block } = this.props;
    return (
      <div className="block">
        Index: {block.index}
        <br />
        Hash: {block.hash}
        <br />
        Transactions:
        <br />
        {block.data}
      </div>
    );
  }
}

export default Block;
