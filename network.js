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

let peers = [];

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/peers', (req, res) => {
    res.json(peers);
});

app.post('/join', (req, res) => {
    let { endpoint } = req.body;
    if (peers.indexOf(endpoint) === -1) {
        peers.push(endpoint);
        res.send(endpoint + " now connected");
        updatePeers();
    }
    else res.send(endpoint + " already connected");
});

app.post('/disconnect', (req, res) => {
    let { endpoint } = req.body;
    let index = peers.indexOf(endpoint);
    if (index !== -1) {
        peers.splice(index, 1);
        res.send(endpoint + " disconnected");
        updatePeers();
    }
    else res.send(endpoint + " wasn't connected")
});

function updatePeers() {
    return Promise.all(
        peers.forEach(peer => {
            return new Promise((resolve, reject) => {
                fetch(peer + "/peers", {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({ peers })
                })
                    .then(function (res) { resolve(res) })
                    .catch(function (res) { reject(res) })
            });
        })
    );
}

app.listen(3000, () => console.log('Example app listening on port 3000!'))