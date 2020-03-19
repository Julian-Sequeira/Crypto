# Blockchain nodes

main.js is the express and P2P server for the blockchain nodes.

The blockchain ledger is stored in memory and in a sqlite3 databse

The "mempool" (list of pending transactions) are stored in memory

List of APIs:
- allBlocks
- lastBlock
- getNewBlocks
- addBlock
- peers
- addPeer
- transactions
- addTransaction
- getBalance
- getTransactions

# Running

npm start    -  for development server
npm run release  -  for production server
