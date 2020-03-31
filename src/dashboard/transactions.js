import React, { Component } from 'react';
import axios from 'axios';
import Transaction from './transaction.js';
import _ from 'lodash';

class Transactions extends Component {

  state = {
    transactions: []
  }

  async componentDidMount(){
    this.refresh();
  }

  refresh = async () => {
    // console.log('refreshing transactions');
    let transactions;
    try{
      transactions = (await axios.get('http://localhost:3001/transactions')).data;
    }
    catch (e) {
      console.log(e);
    }
    if (transactions !== undefined & !_.isEqual(transactions, this.state.transactions)) {
      this.setState({transactions});
    }
    setTimeout(this.refresh, 5000);
  }

  getTransactionComps = (transactions) => {
    const { setOverlayComponent } = this.props;
    const comps = [];
    transactions.forEach((transaction) => {
      comps.push(<Transaction transaction={transaction} key={transaction.id} setOverlayComponent={setOverlayComponent} />);
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