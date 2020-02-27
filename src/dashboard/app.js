import React, { Component } from 'react';
import './app.css';
import BlockWrapper from './blockWrapper.js';
import Block from '../block.js';
import crypto from 'crypto-js';

function getRandomBlocks(n){
  const blocks = [];
  for (let i = 0; i < n; i++){
    blocks.push(new Block(i,1,1,"TRANSACTION DATA HERE",crypto.SHA1("qwertyuiop" + i)));
  }
  return blocks
}

class App extends Component {
  render() {
    const blocks = getRandomBlocks(10);
    return (
      <div className="App">
        Hi
        <BlockWrapper blocks={blocks} />
      </div>
    );
  }
}

export default App;
