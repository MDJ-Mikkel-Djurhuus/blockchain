const Transaction = require('./transaction');

module.exports = {
    t0: [
        new Transaction("djur", "peter", 5),
        new Transaction("djur", "ulf", 5),
        new Transaction("ulf", "morten", 3),
        new Transaction("theis", "morten", 3),
        new Transaction("peter", "per", 1),
        new Transaction("peter", "olsen", 1)],
    t1: [
        new Transaction("djur", "peter", 5),
        new Transaction("djur", "ulf", 5),
        new Transaction("ulf", "morten", 3),
        new Transaction("theis", "morten", 3),
        new Transaction("peter", "per", 1),
        new Transaction("peter", "olsen", 1)],
    t2: [
        new Transaction("peter", "per", 1),
        new Transaction("peter", "olsen", 1),
        new Transaction("ulf", "kurt", 3),
        new Transaction("kurt", "brit", 3),
        new Transaction("geo", "rasmus", 1),
        new Transaction("morten", "peter", 1)],
    t3: [
        new Transaction("theis", "olsen", 3),
        new Transaction("theis", "geo", 3),
        new Transaction("theis", "morten", 3),
        new Transaction("peter", "per", 1),
        new Transaction("peter", "olsen", 1),
        new Transaction("ulf", "kurt", 3)],
    t4: [
        new Transaction("kurt", "brit", 3),
        new Transaction("geo", "rasmus", 1),
        new Transaction("morten", "peter", 1),
        new Transaction("djur", "peter", 5),
        new Transaction("djur", "ulf", 5),
        new Transaction("ulf", "morten", 3)]
}