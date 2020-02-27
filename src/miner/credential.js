const fs = require('fs');
const crypto = require('crypto');

const KEYS_DIRECTORY = './keys';
const PUBLIC_KEY_PATH = `${KEYS_DIRECTORY}/public.pem`;
const PRIVATE_KEY_PATH = `${KEYS_DIRECTORY}/private.pem`;

const genkeys = (passphrase) => {
  console.log("Generating a public/private key pair");
  let publicKey, privateKey;
  try {
    ({publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: passphrase // to encrypt the private key with
      },
    }));
  } catch (error) {
    console.log('error when creating public/private key pair', error);
    throw error;
  };

  // Write the public key to a file
  try {
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);
    // console.log('public key has been saved.');
  } catch (error) {
    console.log('error when saving public key', error);
    throw error;
  };

  // Write the private key to a file
  try {
    fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
    // console.log('private key has been saved.');
  } catch (error) {
    console.log('error when saving public key', error);
    throw error;
  };
};

const loadKeyPair = () => {
  // check whether keys diretory exists
  fs.stat(KEYS_DIRECTORY, (err, _) => {
    //Check if error defined and the error code is "not exists"
    if (err && err.errno === -2) {
      fs.mkdir(KEYS_DIRECTORY, (err) => {
        if (err) throw err;
      });
    }
  });

  // check whether key pems exist
  if (!(fs.existsSync(PUBLIC_KEY_PATH) && fs.existsSync(PRIVATE_KEY_PATH))) {
    // TODO: Add prompt for passphrase input
    genkeys(KEYS_DIRECTORY, 'password');
  }

  // load public key
  let publicKey = null, privateKey = null;
  try {
    publicKey = fs.readFileSync(PUBLIC_KEY_PATH);
  } catch (error) {
    console.log('error when loading public key from file');
    throw error;
  }

  // load private key
  try {
    privateKey = fs.readFileSync(PRIVATE_KEY_PATH);
  } catch (error) {
    console.log('error when loading private key from file');
    throw error;
  }

  return { publicKey, privateKey };
};

module.exports = { loadKeyPair };
