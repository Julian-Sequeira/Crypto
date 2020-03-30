import React, { Component } from 'react';
import axios from 'axios';
import Transaction from './transaction.js';

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
    // console.log(transactions);
  }

  getTransactionComps = (transactions) => {
    const comps = [];
    transactions.forEach((transaction) => {
      comps.push(<Transaction transaction={transaction} key={transaction.id} />);
    })
    return comps;
  }

  render() {
    const comps = this.getTransactionComps(this.state.transactions);
    return (
      <div className="transactions">
        {comps}
      </div>
    );
  }
}

export default Transactions;