const Block = require('./block');

class Blockchain {
    constructor(difficulty) {
        this.chain = [this.GenesisBlock()];
        this.difficulty = difficulty || 3;
    }

    GenesisBlock() {
        return new Block(0, new Date().getTime() / 1000, "0", "Genesis block");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    generateNextBlock(blockData) {
        let previousBlock = this.getLatestBlock();

        let newBlock = new Block(
            previousBlock.index + 1,
            new Date().getTime() / 1000,
            previousBlock.hash,
            blockData);

        newBlock.mineBlock(this.difficulty);

        return new Block(nextIndex, nextTimestamp, );
    };

    addBlock(newBlock) {
        if (this.isNewBlockValid(newBlock, this.getLatestBlock()))
            this.chain.push(newBlock);
    }

    isNewBlockValid(newBlock, previousBlock) {
        if (previousBlock.index + 1 !== newBlock.index)
            return console.log('Invalid index'), false;
        else if (previousBlock.hash !== newBlock.previousHash)
            return console.log('Invalid previoushash'), false;
        else if (newBlock.calculateHash() !== newBlock.hash)
            return console.log('Invalid hash'), false;
        else if (newBlock.hash.substring(0, difficulty) !== Array(this.difficulty + 1).join("0"))
            return console.log("Block hasn't been mined: " + newBlock.hash), false
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