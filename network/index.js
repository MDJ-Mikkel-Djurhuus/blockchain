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
let port = process.argv[2] || 3000;

let peers = [];

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/transaction', (req, res) => {
    console.log("incomming transaction");
    try {
        let { from, to, amount } = req.body;
        addTransaction(new Transaction(from, to, amount));
    } catch (error) {
        console.log(error);
    }
})

app.get('/peers', (req, res) => {
    console.log("get peers");
    try {
        res.json(peers);
    } catch (error) {
        console.log(error);
    }
});

app.post('/join', (req, res) => {
    console.log("peer trying to join");
    try {
        let { endpoint } = req.body;
        if (peers.indexOf(endpoint) === -1) {
            peers.push(endpoint);
            updatePeers();
            res.send(endpoint + " now connected");
        }
        else res.send(endpoint + " already connected");
    } catch (error) {
        res.send(errer)
    }
});

app.post('/disconnect', (req, res) => {
    console.log("peer trying to disconnect");
    try {
        let { endpoint } = req.body;
        let index = peers.indexOf(endpoint);
        if (index !== -1) {
            peers.splice(index, 1);
            updatePeers();
            res.send(endpoint + " disconnected");
        }
        else res.send(endpoint + " wasn't connected")
    } catch (error) {
        res.send(errer)
    }
});

function updatePeers() {
    console.log("broadcasting peers");
    broadcast("peers", peers)
        .then(function (res) { return res })
        .catch(function (res) { return res })
}
function addTransaction(transaction) {
    console.log("broadcasting a transaction");
    broadcast("transaction", transaction)
        .then(function (res) { return res })
        .catch(function (res) { return res })
}

function broadcast(message, body) {
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

app.listen(port, () => console.log('Network running on port: ' + port));