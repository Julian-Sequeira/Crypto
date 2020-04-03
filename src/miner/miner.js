const express = require('express');
const app = express();
const { loadKeyPair } = require('./credential');
const block = require('./block');
const axios = require('axios');

const {
  publicKey,
  // privateKey,
} = loadKeyPair();

async function mine(){
  const blockTemplate = await block.getBlockTemplate(publicKey);
  block.mineBlock(blockTemplate)
    .then(async (newBlock) => {
      // TODO: send the newly generated block to P2P nodes
      // console.log(JSON.stringify(newBlock));
      try{
        await axios({
          method: 'post',
          url: 'http://localhost:3001/addBlock',
          data: { newBlock }
        });
      }
      catch (e) {
        console.log(e);
      }
    })
    .catch((err) => {
      console.log('error when mining block', err);
    });
}

mine();

// express middleware
app.use(express.json());

// Use Routes
// app.use('/api/users/', require('./routes/api/users'));

const port = process.env.PORT || 8378;

// app.listen(port, () => console.log(`Miner started on port ${port}`));
