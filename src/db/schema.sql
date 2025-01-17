--- load with 
--- sqlite3 database.db < schema.sql
DROP TABLE blockchain;
DROP TABLE block;
DROP TABLE transaction;
DROP TABLE blocktransaction;
DROP TABLE recipient;
DROP TABLE transactionrecipient;


-- Table for the blockchain
CREATE TABLE blockchain (
    id INTEGER PRIMARY KEY AUTO increment,
	blockhash VARCHAR(30) REFERENCES block(blockhash),
	child VARCHAR(30) REFERENCES block(blockhash)
);

-- these are the two variables we need for this project (please change them if necessary)
INSERT INTO blockchain(blockhash,child) VALUES ("genesis","521ae34d0f1bd452103724aa8e53e6793da6fc581adeeac3f13a31fb94272437");
INSERT INTO blockchain(blockhash,child) VALUES ("longest","521ae34d0f1bd452103724aa8e53e6793da6fc581adeeac3f13a31fb94272437");


-- Table for the block
CREATE TABLE block (
	blockhash VARCHAR(30) PRIMARY KEY,
	prehash VARCHAR(30),
	difficulty INTEGER,
	nonce INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- Table for the transaction
CREATE TABLE transaction (
	id VARCHAR(30) PRIMARY KEY,
	signature VARCHAR(30),
    publicKey VARCHAR(30),
    previousID VARCHAR(30),
    previousIdx INTEGER,
    fee REAL
);

--Table that connect which transaction belongs to the block
CREATE TABLE blocktransaction{
    blockhash VARCHAR(30) REFERENCES block(blockhash),
    id VARCHAR(30) REFERENCES transaction(id)
}

--Table for indivual recipent
CREATE TABLE recipient{
    id INTEGER PRIMARY KEY AUTO increment,
    index INTEGER,
    address VARCHAR(30),
    amount INTEGER
}


--Table that connects the recipents with the transaction
CREATE TABLE transactionrecipient{
    id VARCHAR(30) REFERENCES transaction(id),
    recipientID INTEGER REFERENCES recipient(id)
}
