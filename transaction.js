class transaction {
    constructor(from, to, amount, type) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.type = type || "regular";
    }
}

module.exports = transaction;