# Transaction Class

A Transaction object takes in ths following object:

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



# CLI-Wallet

