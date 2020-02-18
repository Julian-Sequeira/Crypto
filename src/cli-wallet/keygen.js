const { generateKeyPair } = require('crypto');

// Generate a key pair using RSA
generateKeyPair('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'deercoin'    // to encrypt the private key with
    }

// Do something with the keys in this callback    
}, (err, publicKey, privateKey) => {

    // Handle errors
    if (err) {
        console.log(err);
    } else {
        console.log(publicKey);
        console.log(privateKey);
    }
});
