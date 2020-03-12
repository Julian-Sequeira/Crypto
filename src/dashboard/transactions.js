import React, { Component } from 'react';
import Tree from 'react-d3-tree';
import axios from 'axios';
import crypto from 'crypto';

class Transactions extends Component {

  state = {
    transactions: []
  }

  async componentDidMount(){
    let transactions;
    try{
      transactions = (await axios.get('http://localhost:3001/transactions')).data;
    }
    catch (e) {
      console.log(e);
    }
    if (transactions !== undefined) {
      this.setState({transactions});
    }
  }

  render() {
    return (
      <div className="transactions">
        {this.state.transactions.toString()}
      </div>
    );
  }
}

export default Transactions;