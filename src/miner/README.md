# Miner

A node program which mines blocks:

1. The miner will issue post(/transactions) request to node server and pull transactions from thes mempool

2. The miner will populate a block template base on the transactions it just got

3. The miner will repeatedly try new nounce until the hash of the block has several zeros in the front

4. The miner will post(/addBlock) request the newly mined block to node server


# Block

## structure

```
{
    header: {
        version,
        prevHash, // previous block header hash
        timestamp,
        currHash, // current block body hash
        difficulty, // number of zeros required
        nonce,
    }
    body: [
        Transaction: { // miner reward transaction
            data: {
                publicKey: null, // sender is set to null
                previousID: '0', // all reward transactions have previous ID of 0
                amount: 1, // the reward amount has to be less or equal to 1
                fee: 0, // this should always be 0
                address // miner's deercoin address
            },
            isNew: false, // this field must be false, otherwise id and signature will be overwritten
            id: 0xFFFFFFFF, // miner reward transaction special id
            signature: null, // signature is set to null
        },
        Transaction,
        Transaction,
        ...
    ]
}
```