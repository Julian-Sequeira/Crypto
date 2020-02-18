const fs = require('fs');
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

// Callback which has access to the keys    
}, (err, publicKey, privateKey) => {
    if (err) throw err; 

    // Write the public key to a file (fd = file descriptor)
    fs.open('pubkey.pem', 'w', (err, fd) => {
        if (err) throw err;
        fs.write(fd, publicKey, (err, written, string) => { if (err) throw err; })
        fs.close(fd, (err) => { if (err) throw err; })
    })

    // Write the private key to a file 
    // Should be fine if done asynchronously since they aren't logically dependent
    fs.open('privkey.pem', 'w', (err, fd) => {
        if (err) throw err;
        fs.write(fd, privateKey, (err, written, string) => { if (err) throw err; })
        fs.close(fd, (err) => { if (err) throw err; }) 
    })
});


