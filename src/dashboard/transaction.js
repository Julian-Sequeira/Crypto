import React, { Component } from 'react';
import TransactionPage from './transactionPage.js';
import { shorten } from './utils.js';

class Transaction extends Component {

  handleClick = () => {
    const { transaction, setOverlayComponent } = this.props;
    if (setOverlayComponent) {
      const comp = <TransactionPage transaction={transaction} />;
      setOverlayComponent(comp, transaction.id);
    }
  }

  getRecipientComps = () => {
    const { transaction } = this.props;
    const recipients = transaction.data.recipients;
    const comps = [];
    recipients.forEach((recipient) => {
    const comp = <div className='recipient' key={`${recipient.address}:${recipient.index}`} >- {shorten(recipient.address, 16)} : {recipient.amount}</div>;
      comps.push(comp);
    });
    return comps;
  }

  render() {
    const { transaction } = this.props;
    // const recipientString = transaction.data.recipients ? transaction.data.recipients.map(rcpt => `(${shorten(rcpt.address, 6)}, ${rcpt.amount}) `) : '';
    const recipients = this.getRecipientComps();
    return (
      <div className="transaction" onClick={this.handleClick}>
        {shorten(transaction.data.publicKey, 16)}
        {recipients}
      </div>
    );
  }
}

export default Transaction;