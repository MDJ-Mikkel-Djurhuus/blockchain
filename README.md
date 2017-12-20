# Blockchain
Blockchain is way to store data. It is basicly a linked list, where the data gets bundled together in blocks and just like in a linked list, each block links to the previous block (with cryptography).

## Block
Represents a block of data (transactions when talking about cryptocurrency).

our implementation:
```javascript
const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timestamp, previousHash, transactions, hash, nonce) {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = hash || this.calculateHash();
        this.nonce = nonce || 0;
    }

    calculateHash() {
        return SHA256(this.index + this.timestamp + this.previousHash + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

module.exports = Block;
```
## Transaction
In this example we are implementing a simple currency blockchain, therefor the data that gets stored in the blocks are transactions. As this is just a simple implementation, we dont implement digital signing and other security meassures that you would find in "real" cryptocurrency like Bitcoin.

our implementation:
```javascript
class transaction {
    constructor(from, to, amount, type) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.type = type || "regular";
    }
}

module.exports = transaction;
```
## Blockchain
The blockchain is responsible for verifying incomming transactions/blocks and making sure that they are synchronized with the other peers.

our implementation:
```javascript
const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {
    constructor(difficulty) {
        this.chain = [this.GenesisBlock()];
        this.difficulty = difficulty || 3;
        this.transactions = [];
    }
    
    GenesisBlock() {
        return new Block(0, new Date().getTime() / 1000, 0, [{ to: "djur", amount: 10 }, { to: "theis", amount: 10 }]);
    }
    
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    generateNextBlock(user) {
        if (this.transactions.length > 1) {
            let previousBlock = this.getLatestBlock();
            let transactions = this.transactions.slice(-1);
            transactions.push(new Transaction(null, user, 10, "reward"))

            let newBlock = new Block(
                previousBlock.index + 1,
                new Date().getTime() / 1000,
                previousBlock.hash,
                transactions);

            newBlock.mineBlock(this.difficulty);

            return newBlock;
        }
        return false;
    };

    addTransaction(newTransaction) {
        if (newTransaction.type === "regular" && this.isTransactionValid(newTransaction))
            this.transactions.push(newTransaction);
    }

    addBlock(newBlock) {
        if (this.isNewBlockValid(newBlock))
            this.chain.push(newBlock);
        else throw "block not valid";
    }

    userHasAmount(user, amount) {
        let userAmount = this.chain.reduce((acc, cur) => {
            return Array.isArray(cur.transactions) ? acc.concat(cur.transactions) : acc.push(cur.transactions);
        }, [])
            .filter(transaction => transaction.to === user)
            .reduce((acc, cur) => acc += cur.amount, 0)

        if (userAmount >= amount) return true;
        else return false;
    }

    isTransactionValid(transaction) {
        let { from, to, amount, type } = transaction;
        if (type === "regular" && this.userHasAmount(from, amount)) return true;
        else if (type === "reward" && amount === 10) return true;
        else return false;
    }

    isNewBlockValid(newBlock) {
        let previousBlock = this.getLatestBlock();
        if (previousBlock.index + 1 !== newBlock.index)
            return console.log('Invalid index'), false;
        else if (previousBlock.hash !== newBlock.previousHash)
            return console.log('Invalid previoushash'), false;
        else if (newBlock.calculateHash() !== newBlock.hash)
            return console.log('Invalid hash'), false;
        else if (newBlock.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0"))
            return console.log("Block hasn't been mined: " + newBlock.hash), false;
        else if (!Array.from(newBlock.transactions).every(isTransactionValid))
            return console.log('Invalid transactions'), false;
        else if (!Array.from(newBlock.transactions).filter(t => t.type === "reward").length !== 1)
            return console.log('Invalid transaction reward'), false;
        return true;
    }

    isChainValid(chain = this.chain) {
        for (let i = 1; i < chain.length; i++) {
            const currentBlock = chain[i];
            const previousBlock = chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) return false;
            if (currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }
}

module.exports = Blockchain;
```
# References
https://www.youtube.com/watch?v=_160oMzblY8 - Blockchain 101 - A Visual Demo

https://www.youtube.com/watch?v=zVqczFZr124 - Creating a blockchain with Javascript (Blockchain, part 1)

https://www.youtube.com/watch?v=HneatE69814 - Implementing Proof-of-Work in Javascript (Blockchain, part 2)

https://www.savjee.be/2017/07/Writing-tiny-blockchain-in-JavaScript/

https://medium.com/@lhartikk/a-blockchain-in-200-lines-of-code-963cc1cc0e54

https://blockgeeks.com/guides/what-is-blockchain-technology/

https://hackernoon.com/a-cryptocurrency-implementation-in-less-than-1500-lines-of-code-d3812bedb25c
