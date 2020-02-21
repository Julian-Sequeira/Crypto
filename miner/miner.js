const express = require('express');
const app = express();
const credential = require('./credential');
const block = require('./block');

const {
  publicKey,
  // privateKey,
} = credential.loadKeyPair();

const blockTemplate = block.getBlockTemplate(publicKey);
console.log(blockTemplate);

// express middleware
app.use(express.json());

// Use Routes
// app.use('/api/users/', require('./routes/api/users'));

const port = process.env.PORT || 8378;

app.listen(port, () => console.log(`Miner started on port ${port}`));
