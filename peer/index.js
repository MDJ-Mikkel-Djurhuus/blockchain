const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const fetch = require("node-fetch");
const Block = require('../block');
const Blockchain = require('../blockchain');
const Transaction = require('../transaction');
const testData = require('../testdata');

let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

let network = process.env.network || "http://localhost:3000";
let port = process.env.port || process.argv[2] || 8080;

let peers = [];
let chain = new Blockchain();

app.use(bodyParser.json()); // for parsing application/json

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/peers', (req, res) => {
    console.log("updating peers..");
    peers = req.body.filter(x => x !== "http://localhost:" + port);
    console.log("peers updated", peers)
    res.send("peers updated");
})

app.post('/transaction', (req, res) => {
    console.log("incomming transaction..");
    let { from, to, amount } = req.body;
    try {
        chain.addTransaction(new Transaction(from, to, amount));
        res.send("transaction added");
    } catch (error) {
        console.log(error);
        res.send(404, error)
    }
})

app.post('/block', (req, res) => {
    console.log("incomming block..");
    let { index, timestamp, previousHash, transactions, hash, nonce } = req.body;
    try {
        chain.addBlock(new Block(index, timestamp, previousHash, transactions, hash, nonce));
        res.send("block added");
    } catch (error) {
        console.log(error);
        res.send(404, error)
    }
})

app.get('/mine', (req, res) => {
    console.log("starting to mine..");
    mine();
    res.send("mining block");
})

app.get('/chain', (req, res) => {
    console.log("here is my chain");
    res.json(chain)
})


var server = app.listen(port, () => {
    console.log('peer on port: ' + port);
    setTimeout(() => {
        join().then((res) => {
            console.log(res)
            addTestData();
        }).catch((res) => {
            console.log(res)
        });
    }, 3000);
});

function addTestData() {
    let testTransactions = testData["t" + parseInt(Math.random() * 4)];
    testTransactions.forEach(transaction => {
        addNewTransaction(transaction);
    });
}

function mine() {
    return new Promise((resolve, reject) => {
        let newBlock = chain.generateNextBlock();
        if (newBlock) {
            newBlock(newBlock);
            resolve("new block added");
        } else {
            reject("failed adding new block")
        }
    })
}

function addNewTransaction(transaction) {
    chain.addTransaction(transaction)
    broadcast("transaction", transaction);
}
function addNewBlock(block) {
    broadcast("block", block);
}

function broadcast(message, body) {
    console.log("broadcasting a " + message);
    let calls = peers.map(peer => sendMessage(peer + "/" + message, body))
    return Promise.all(calls);
}

function sendMessage(url, body) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: method,
            headers: headers,
            body: JSON.stringify(body)
        })
            .then(function (res) { resolve(res) })
            .catch(function (res) { reject(res) })
    });
}

// function getChain() {
//     fetch(network + "/join", {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify({ endpoint: "http://localhost:" + port })
//     })
//         .then(function (res) {
//             let { chain } = res;
//             if (chain.length > _chain && chain.isChainValid())
//                 _chain = chain;
//         })
//         .catch(function (res) { })
// }

function join() {
    console.log("joining network..");
    return new Promise((resolve, reject) => {
        fetch("http://localhost:3000/join", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ endpoint: "http://localhost:" + port })
        })
            .then(res => resolve("joined"))
            .catch(res => reject("failed to join"))
    });
}

function disconnect() {
    console.log("disconnecting..")
    return new Promise((resolve, reject) => {
        fetch("http://localhost:3000/disconnect", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ endpoint: "http://localhost:" + port })
        })
            .then(res => resolve("disconnected"))
            .catch(res => reject("failed to disconnect"))
    });
}

// this function is called when you want the server to die gracefully
// i.e. wait for existing connections
function gracefulShutdown() {
    console.log("Received kill signal, shutting down gracefully.");
    server.close(function () {
        console.log("Closed out remaining connections.");
        disconnect()
            .then(res => { console.log(res); process.exit(); })
            .catch(res => { console.log(res); process.exit(); })
    });

    // if after 
    setTimeout(function () {
        console.error("Could not close connections in time, forcefully shutting down");
        process.exit()
    }, 10 * 1000);
}

// listen for TERM signal .e.g. kill 
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);


