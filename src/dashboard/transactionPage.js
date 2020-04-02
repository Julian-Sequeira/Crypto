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
    const comp = <div className='recipient' key={`${recipient.address}:${recipient.index}`} >- {shorten(recipient.address, 16)}</div>;
      comps.push(comp);
    });
    return comps;
  }

  getRecipientCompsIcons = () => {
    const { transaction } = this.props;
    const recipients = transaction.data.recipients;
    const comps = [];
    recipients.forEach((recipient) => {
      const comp = 
      <div className='transactionPageIconToRec' key={`icon-${recipient.address}:${recipient.index}`} >
        {recipient.amount.toString().padStart(3, '0')}
        &nbsp;&nbsp;
        <img src="/dcoin.png" height="50" width="50"></img>
        &nbsp;&nbsp;
        {shorten(recipient.address,8)}
      </div>;
      comps.push(comp);
    });
    const comp = 
    <div className='transactionPageIconToRec' key={`icon-fee`} >
      {transaction.data.fee.toString().padStart(3, '0')}
      &nbsp;&nbsp;
      <img src="/dcoin.png" height="50" width="50"></img>
      &nbsp;&nbsp;
      miner fee
    </div>;
    comps.push(comp);
    return comps;
  }

  getTotalAmount = () => {
    const { transaction } = this.props;
    const fee = transaction.data.fee;
    const recipientAmounts = transaction.data.recipients.map(x => x.amount);
    const recipientSum = arr => arr.reduce((a,b) => a + b, 0);
    return fee + recipientSum(recipientAmounts);
  }

  render() {
    const { transaction } = this.props;
    console.log(transaction);
    const previousIDs = this.getPreviousComps();
    const recipients = this.getRecipientComps();
    const recipientIcons = this.getRecipientCompsIcons();
    return (
      <div className="transactionPage">
        <div className="transactionPageIcon">
          <div className="transactionPageIconFrom">
            FROM
            <br /><br />
            <div>
              {shorten(transaction.data.publicKey, 30)}
            </div>
          </div>
          <div className="transactionPageIconCoins">
            <div>
              {this.getTotalAmount()}
            </div>
            <br />
            <img src="/dcoin.png" height="100" width="100"></img>
          </div>
          <div className="transactionPageIconTo">
            <div className="centered">
              TO
            </div>
            {recipientIcons}
          </div>
        </div>
        <div>
          <br /><br />
          Details: <br /><br />
          transaction id: {transaction.id} <br />
          signature: {shorten(transaction.signature, 16)} <br /><br />
          previous transaction IDs: {previousIDs} <br />
          sender: {shorten(transaction.data.publicKey, 12)} <br />
          transaction fee: {transaction.data.fee} <br /><br />
          recipients: {recipients} <br />
        </div>
      </div>
    );
  }
}

export default TransactionPage;
