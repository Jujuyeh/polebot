var newParty = require('./set').newParty;
var newUser = require('./set').newUser;
var getRanking = require('./get').getRanking;
var getParty = require('./get').getParty;
var setParty = require('./set').setParty;
var getUser = require('./get').getUser;
var score = require('./set').score;

module.exports = {
    newParty,
    newUser,
    getRanking,
    getParty,
    setParty,
    getUser,
    score
};