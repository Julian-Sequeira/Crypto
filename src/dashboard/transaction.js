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

  getRecipientCompsIcons = () => {
    const { transaction } = this.props;
    const recipients = transaction.data.recipients;
    const comps = [];
    recipients.forEach((recipient) => {
      const comp = 
      <div className='transactionIconToRec' key={`icon-${recipient.address}:${recipient.index}`} >
        {recipient.amount.toString().padStart(3, '0')}
        &nbsp;&nbsp;
        <img src="/dcoin.png" height="20" width="20"></img>
        &nbsp;&nbsp;
        {shorten(recipient.address,8)}
      </div>;
      comps.push(comp);
    });
    const comp = 
    <div className='transactionIconToRec' key={`icon-fee`} >
      {transaction.data.fee.toString().padStart(3, '0')}
      &nbsp;&nbsp;
      <img src="/dcoin.png" height="20" width="20"></img>
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
    const recipientIcons = this.getRecipientCompsIcons();
    return (
      <div className="transaction" onClick={this.handleClick}>
        
          <div className="transactionIconFrom">
            FROM
            <br /><br />
            <div>
              {shorten(transaction.data.publicKey, 26)}
            </div>
          </div>
          <div className="transactionIconCoins">
            <div>
              {this.getTotalAmount()}
            </div>
            <br />
            <img src="/dcoin.png" height="70" width="70"></img>
          </div>
          <div className="transactionIconTo">
            <div className="leftABit">
              TO
            </div>
            {recipientIcons}
          </div>
      </div>
    );
  }
}

export default Transaction;