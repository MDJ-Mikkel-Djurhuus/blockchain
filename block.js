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
        // console.log("started mining block " + this.index + "...");
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        // console.log("done mining block " + this.index + ": " + this.hash);
    }
}

module.exports.Block = Block;