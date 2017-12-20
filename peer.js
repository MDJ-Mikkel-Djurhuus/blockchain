var bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.json()); // for parsing application/json
const fetch = require("node-fetch");
const Block = require('./block');
const Blockchain = require('./blockchain');
const Transaction = require('./transaction');

let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};
let network = "http://localhost:3000";
let port = 8080;

let peers = [];
let chain = new Blockchain();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/peers', (req, res) => {
    let { _peers } = req.body;
    peers = _peers.filter(x => x !== "http://localhost:" + port);
})

app.post('/transaction', (req, res) => {
    let { from, to, amount } = req.body;
    try {
        chain.addTransaction(new Transaction(from, to, amount))
    } catch (error) {
        console.log(error);
    }
})

app.post('/block', (req, res) => {
    let { index, timestamp, previousHash, transactions, hash, nonce } = req.body;
    try {
        chain.addBlock(new Block(index, timestamp, previousHash, transactions, hash, nonce))
    } catch (error) {
        console.log(error);
    }
})

app.get('/mine', (req, res) => {
    try {
        addBlock();
    } catch (error) {
        console.log(error);
    }
})

var server = app.listen(port, () => console.log('client!'));
join();

function addTransaction() {
    broadcast("transaction", chain.generateNextBlock());
}

function addBlock() {
    let newBlock = chain.generateNextBlock();
    if (newBlock)
        broadcast("block", newBlock);
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
        body: JSON.stringify({ endpoint: "http://localhost:" + port })
    })
        .then(function (res) { })
        .catch(function (res) { })
}

function disconnect() {
    fetch(network + "/disconnect", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ endpoint: "http://localhost:" + port })
    })
        .then(function (res) { })
        .catch(function (res) { })
}

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


