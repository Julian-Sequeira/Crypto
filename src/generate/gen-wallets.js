// Created imports
const utils = require('./utils.js');

/**
 * Make a folder for all the wallets
 * Then make a starting wallet (first)
 * Then make NUMWALLETS more wallets to pass money around
 */

utils.makeDir('wallets');
utils.makeWallet('first');
let name;
for (let i = 0; i < utils.NUMWALLETS; i++) {
    name = 'wallet' + i.toString();
    utils.makeWallet(name);
    console.log(`Generated ${name}`);
}

utils.makeWallet('mobile');