import React, { Component } from 'react';
import { shorten } from './utils.js';

class TransactionPage extends Component {

  getPreviousComps = () => {
    const { transaction } = this.props;
    const previous = transaction.data.previous;
    const comps = [];
    previous.forEach((prevTrans) => {
    const comp = <div className='previousID' key={`${prevTrans.previousID}:${prevTrans.previousIdx}`} >- {prevTrans.previousID}:{prevTrans.previousIdx}</div>;
      comps.push(comp);
    });
    return comps;
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
    // console.log(transaction);
    const previousIDs = this.getPreviousComps();
    const recipients = this.getRecipientComps();
    return (
      <div className="transactionPage">
        transaction id: {transaction.id} <br />
        signature: {shorten(transaction.signature, 16)} <br /><br />
        previous transaction IDs: {previousIDs} <br />
        sender: {shorten(transaction.data.publicKey, 12)} <br />
        transaction fee: {transaction.data.fee} <br /><br />
        recipients: {recipients} <br />
      </div>
    );
  }
}

export default TransactionPage;
