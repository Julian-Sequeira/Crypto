import React, { Component } from 'react';
import BlockTree from './blockTree.js';
import Transactions from './transactions.js';

class Home extends Component {
  
  state = {
    showOverlay: false,
    overlayComp: null,
    overlayId: null
  }

  hideOverlay = () => {
    this.setState({ showOverlay: false });
  }

  setOverlayComponent = (overlayComp, overlayId) => {
    this.setState({ showOverlay: false }, () => {
      this.setState({ showOverlay: true, overlayComp, overlayId })});

  }

  render() {
    const { showOverlay, overlayComp } = this.state;
    return (
      <div className="home">
        {showOverlay ? 
          <div className="blockOverlay">
            {overlayComp ? overlayComp : ''}
            <button className="closeButton" onClick={this.hideOverlay}>X</button>
          </div> 
          :
          <div />
        }
        <Transactions setOverlayComponent={this.setOverlayComponent} />
        <BlockTree setOverlayComponent={this.setOverlayComponent} />
      </div>
    );
  }
}

export default Home;
