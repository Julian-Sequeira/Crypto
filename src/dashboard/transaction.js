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

  handleTransactionClick = (transaction) => {
    const { setOverlayComponent } = this.props;
    const comp = <TransactionPage transaction={transaction} />;
    setOverlayComponent(comp, transaction.id);
  }

  render() {
    const { transaction } = this.props;
    const recipientString = transaction.data.recipients ? transaction.data.recipients.map(rcpt => `(${shorten(rcpt.address, 6)}, ${rcpt.amount}) `) : '';
    return (
      <div className="transaction" onClick={this.handleClick}>
        {shorten(transaction.data.publicKey, 6)} -> [{recipientString}(fee, {transaction.data.fee})]
      </div>
    );
  }
}

export default Transaction;