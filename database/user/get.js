var User = require('../../models/User.js').User;
var Party = require('../../models/User.js').Party;
var to = require('await-to-js').to;

async function getRanking(party) {
    const partyMembers = await User.find({
        'chat': party
    }).sort({
        'score': -1
    }).exec();
    let s = "";
    s += "*Ranking de poles*\n\n";
    for (const [index, value] of partyMembers.entries()) {
        s += `\`${index+1}. ${value.username.padEnd(16,".")}${value.score.toString().padStart(5,".")} pts.\n\``;
    }
    s += "\n\n\n";
    s += `¡${partyMembers[0].username}, estás que lo petas!`
    return s;
}

async function getParty(chat) {
    return await Party.findById(chat).exec();
}

async function getUser(username, chat) {
    const filter = {
        "username": username,
        "chat": chat
    };

    let user = await User.findOne(filter);
    return user;
}

module.exports = {
    getRanking,
    getParty,
    getUser
};