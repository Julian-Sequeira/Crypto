# Transaction Class

A Transaction object takes in the following object:

args = {
    data:{
        publicKey, 
        previous: [{ previousID, previousIdx }] 
        fee, 
        recipients: [{ index, address, amount }],
        type
    },       
    id: transaction ID (not needed if new transaction),
    signature: transaction signature (not needed if new transaction),
    isNew: boolean to indicate new transaction or not,
    passphrase: use this to decrypt the encrypted private key stored on file,
    directory: folder where the encrypted private key is stored
}

- When sending a transaction over the network, you can use transaction.serializedData() to
get a serial string to send. 

It also contains the following verification functions:
    
1) verifyTrxSignature - verifies that a transaction's signature corresponds to the sender's public key 
    
2) verifyFromPrevious - checks that the public keys or the previous recipient and the current sender match, and that the amount of money sent adds up

MORE FUNCTIONS HERE THAT I DON'T FULLY UNDERSTAND

# CLI-Wallet

Command line utility for walley functions

START:
- ./cli-wallet --start
- Creates a public-private key pair in the keys folder

BALANCE:
- ./cli-wallet --balance
- Checks your wallet's current balance from the blockchain

TRANSACTIONS:
- ./cli-wallet --transactions
- Grabs your wallet's transaction history from the blockchain

CREATE A NEW TRANSACTION:
