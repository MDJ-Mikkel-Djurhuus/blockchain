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