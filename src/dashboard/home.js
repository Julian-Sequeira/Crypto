import React, { Component } from 'react';
import BlockTree from './blockTree.js';
import Transactions from './transactions.js';

class Home extends Component {
  render() {
    return (
      <div className="home">
        <Transactions />
        <BlockTree />
      </div>
    );
  }
}

export default Home;
