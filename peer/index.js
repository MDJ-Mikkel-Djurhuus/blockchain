var bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.json()); // for parsing application/json
const fetch = require("node-fetch");
const Block = require('../block');
const Blockchain = require('../blockchain');
const Transaction = require('../transaction');

let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};
let network = process.env.network || "http://localhost:3000";
let port = process.env.port || 8080;

let peers = [];
let chain = new Blockchain();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/peers', (req, res) => {
    console.log("get peers..");
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


function addTransaction() {
    broadcast("transaction", chain.generateNextBlock());
}

function mine() {
    return new Promise((resolve, reject) => {
        let newBlock = chain.generateNextBlock();
        if (newBlock) {
            broadcast("block", newBlock);
            resolve("new block added");
        } else {
            reject("failed adding new block")
        }
    })
}

function broadcast(message, body) {
    return Promise.all(
        _peers.forEach(peer => {
            return new Promise((resolve, reject) => {
                fetch(peer + "/" + message, {
                    method: method,
                    headers: headers,
                    body: JSON.stringify(body)
                })
                    .then(function (res) { resolve(res) })
                    .catch(function (res) { reject(res) })
            });
        })
    );
}

function getChain() {
    fetch(network + "/join", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ endpoint: "http://localhost:" + port })
    })
        .then(function (res) {
            let { chain } = res;
            if (chain.length > _chain && chain.isChainValid())
                _chain = chain;
        })
        .catch(function (res) { })
}

function join() {
    fetch(network + "/join", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ endpoint: "http://localhost:" + 3000 })
    })
        .then(function (res) { })
        .catch(function (res) { })
}

function disconnect() {
    fetch(network + "/disconnect", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ endpoint: "http://localhost:" + 3000 })
    })
        .then(function (res) { })
        .catch(function (res) { })
}

var server = app.listen(8080, () => console.log('peer on port: ' + port));

// this function is called when you want the server to die gracefully
// i.e. wait for existing connections
function gracefulShutdown() {
    console.log("Received kill signal, shutting down gracefully.");
    server.close(function () {
        console.log("Closed out remaining connections.");
        disconnect();
        process.exit()
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

join();


