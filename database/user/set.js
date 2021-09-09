var User = require('../../models/User.js').User;
var Party = require('../../models/User.js').Party;
var getGroupById = require('./get').getGroupById;
var getMemberIdsFromGroup = require('./get').getMemberIdsFromGroup;
var to = require('await-to-js').to;

async function newParty(id) {
    return new Promise(async (resolve, _) => {
        const party = await Party.findById(id);

        if (party) {
            return;
        }

        return resolve(
            await Party.create({
                _id: id,
                current: 'none',
                last_set: new Date(0) / 1000
            })
        )
    })
}

async function newUser(username, chat) {
    const user = await User.findOne({
        username: username,
        chat: chat
    });

    if (user) {
        return user;
    }

    return new Promise(async (resolve, _) => {

        return resolve(
            await User.create({
                username: username,
                chat: chat,
                score: 0.0,
                last_set: new Date(0)
            })
        )
    })
}

async function setParty(id, newstatus, newdate) {
    return new Promise(async (resolve, _) => {

        const filter = {
            "_id": id,
        };
        const update = {
            current: newstatus,
            last_set: newdate
        };

        return resolve(
            await Party.findOneAndUpdate(filter, update)
        );
    })
}

async function score(username, chat, value) {
    return new Promise(async (resolve, _) => {
        const filter = {
            "username": username,
            "chat": chat
        };

        const user = await User.findOne(filter);

        if (!user) {
            await newUser(user, chat);
        }

        const update = {
            $inc: {
                score: value
            }
        }

        return resolve(
            await User.findOneAndUpdate(filter, update)
        );
    })
}

module.exports = {
    newParty,
    newUser,
    setParty,
    score
};