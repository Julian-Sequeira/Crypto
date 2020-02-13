var sqlite3 = require('sqlite3').verbose();

class Database {
  constructor(db) {
    this.db = db;
    this.db.run(`CREATE TABLE IF NOT EXISTS blocks 
    (blockIndex integer,
    hash text,
    previousHash text,
    timestamp datetime,
    data text,
    PRIMARY KEY (blockIndex, hash))`);
  }

  addBlock(block){
    var stmt = this.db.prepare("INSERT INTO blocks VALUES (?,?,?,?,?)");
    stmt.run(1,"AAAABBBCCC", "BBBCCCDDD", "Feb 13 2020", "block data :)", (err, rows) => {
      if(err){
        print(err);
      }
    });
    stmt.finalize();
  }

  test(){
    this.db.serialize(function() {
      this.db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");
     
      var stmt = this.db.prepare("INSERT INTO lorem VALUES (?)");
      for (var i = 0; i < 10; i++) {
          stmt.run("Ipsum " + i);
      }
      stmt.finalize();
     
      this.db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
          console.log(row.id + ": " + row.info);
      });
    }.bind(this));
  }

  close(){
    console.log('closing database');
    this.db.close();
  }
}

var singletonDb = null;

function getDb() {
  if (singletonDb !== null){
    console.log('sending old db');
    return singletonDb;
  }
  else {
    let db = new sqlite3.Database('database.sqlite');
    console.log('connecting to database');
    singletonDb = new Database(db);
    return singletonDb;
  }
}

module.exports = getDb;
