var fs = require('fs');

class fileIO{
    constructor(){
    }

    writeIO(chain, genesisBlock){
        var obj = {}
        obj['chain'] = chain;
        obj['genesisBlock'] = genesisBlock;
        var json = JSON.stringify(obj);
        fs.writeFile('blockchain.json',json,'utf8',function(err){} );
    }

    readIO(){
        var obj = fs.readFileSync('blockchain.json','utf8');
        return JSON.parse(obj);
    }

    doesExist(){
        if(fs.existsSync('blockchain.json')){
            return true;
        }
        return false;
    }
}

module.exports.fileIO = fileIO;
