import React, { Component } from 'react';
import { shorten } from './utils.js';

class TransactionPage extends Component {
  render() {
    const { transaction } = this.props;
    console.log(transaction);
    return (
      <div className="transactionPage">
        transaction id: {transaction.id} <br />
        signature: {shorten(transaction.signature, 16)} <br /><br />
        previous transactions: TBA <br /><br />
        sender: {shorten(transaction.data.publicKey, 12)} <br />
        transaction fee: {transaction.data.fee} <br /><br /><br />
        recipients: TBA <br />
      </div>
    );
  }
}

export default TransactionPage;
