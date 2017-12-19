const Blockchain = require('../blockchain');
const Block = require('../block');
const assert = require('assert');

describe('Blockchain', function () {

    let testBlockChain = new Blockchain();

    describe("Validate chain", function () {
        before(function () {
            testBlockChain = new Blockchain();
            testBlockChain.addBlock(testBlockChain.generateNextBlock({ value: 100 }))
            testBlockChain.addBlock(testBlockChain.generateNextBlock({ value: 3 }))
        })

        it('Valid chain returns true', function () {
            assert.equal(testBlockChain.isChainValid(), true)
        })

        it('Corrupt chain returns false', function () {
            testBlockChain.chain[1].data = { value: 34 };
            assert.equal(testBlockChain.isChainValid(), false)
        })
    })
    describe("Add block", function () {
        before(function () {
            testBlockChain = new Blockchain();
        })
        it('Valid', function () {
            let length = testBlockChain.chain.length;
            testBlockChain.addBlock(testBlockChain.generateNextBlock({ value: 100 }))
            assert.equal(length + 1, testBlockChain.chain.length);
        })
        it('Corrpt index', function () {
            let length = testBlockChain.chain.length;
            let newBlock = testBlockChain.generateNextBlock({ value: 100 })
            newBlock.index = 1;
            testBlockChain.addBlock(newBlock)
            assert.equal(length, testBlockChain.chain.length);
        })
    })

    describe("Hackable", function () {
        before(function () {
            testBlockChain = new Blockchain();
            testBlockChain.addBlock(testBlockChain.generateNextBlock({ value: 100 }))
            testBlockChain.addBlock(testBlockChain.generateNextBlock({ value: 3 }))
            testBlockChain.addBlock(testBlockChain.generateNextBlock({ value: 24 }))
            testBlockChain.addBlock(testBlockChain.generateNextBlock({ value: 3352 }))
            testBlockChain.addBlock(testBlockChain.generateNextBlock({ value: 242 }))
        })
        it('not hackable in less than 100ms', function () {
            testBlockChain.chain[1].data = { value: 34 };
            assert.equal(testBlockChain.isChainValid(), false)
        })
    })

});