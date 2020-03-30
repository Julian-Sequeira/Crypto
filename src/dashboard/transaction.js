import React, { Component } from 'react';
import { shorten } from './utils.js';

class Transaction extends Component {

  render() {
    const { transaction } = this.props;
    const recipientString = transaction.data.recipients.map(rcpt => `(${shorten(rcpt.address, 6)}, ${rcpt.amount}) `)
    return (
      <div className="transaction">
        {shorten(transaction.data.publicKey, 6)} -> [{recipientString}(fee,{transaction.data.fee})]
      </div>
    );
  }
}

export default Transaction;