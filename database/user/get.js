import { User, Party } from "../../models/User.js";

export async function getRanking(party) {
    const partyMembers = await User.find({
        chat: party,
    })
        .sort({
            score: -1,
        })
        .exec();
    let s = "";
    s += "*Ranking de poles*\n\n";
    for (const [index, value] of partyMembers.entries()) {
        s += `\`${index + 1}. ${value.username.padEnd(16, ".")}${value.score
            .toString()
            .padStart(5, ".")}\n\``;
    }
    s += "\n\n\n";
    s += `¡${partyMembers[0].username}, estás que lo petas!`;
    return s;
}

export async function getParty(chat) {
    return await Party.findById(chat).exec();
}

export async function getUser(username, chat) {
    const filter = {
        username: username,
        chat: chat,
    };

    let user = await User.findOne(filter);
    return user;
}
