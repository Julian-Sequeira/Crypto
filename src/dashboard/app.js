import React, { Component } from 'react';
import './app.css';
import BlockTree from './blockTree.js';
import Transactions from './transactions.js';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Transactions />
        <BlockTree />
      </div>
    );
  }
}

export default App;
