/*
 * Bot Game Library
 *
 * Author: Jujuyeh
 * License: GNU General Public License version 3.0
 */

/* --------------------------------- IMPORTS -------------------------------- */
let newUser = require('./database/user/index').newUser;
let newParty = require('./database/user/index').newParty;
let getRanking = require('./database/user/index').getRanking;
let getParty = require('./database/user/index').getParty;
let setParty = require('./database/user/index').setParty;
let getUser = require('./database/user/index').getUser;
let score = require('./database/user/index').score;
var to = require('await-to-js').to;

/* --------------------------------- GLOBALS -------------------------------- */
const ORO = 3.0;
const PLATA = 1.0;
const BRONCE = 0.5;

/* ---------------------------- AUXILIAR METHODS ---------------------------- */
// Returns a chat ID casted to a valid Mongo ObjectID as String.
function stringChat(ctx) {
    return Math.abs(ctx.message.chat.id).toString().padStart(24, "0");
}

// Compares if the date of the context's (ctx) message is the same as (last_set)
function sameDay(ctx, last_set) {
    let d1 = new Date(ctx.message.date * 1000);
    let d2 = new Date(last_set * 1000);

    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

// Compares if (last_set) is in today.
function played(last_set) {
    let d1 = new Date();
    let d2 = last_set;

    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

/* -------------------------------------------------------------------------- */
/*                               POLE FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// Scores a 'pole' rank given a context (ctx).
async function pole(ctx) {
    var success = false;
    let chat = stringChat(ctx);
    let [_, party] = await to(getParty(chat));
    let [e, user] = await to(newUser(ctx.message.from.username, chat));

    if (!sameDay(ctx, party.last_set) && !played(user.last_set)) {
        success = true;
        setParty(chat, 'pole', ctx.message.date);
        score(ctx.message.from.username, chat, ORO);

        ctx.telegram.sendMessage(ctx.message.chat.id, `¡Olé!\n\nQue ${ctx.from.first_name} (${ctx.from.username}) ha hecho la pole. 💃`);
    }

    return success;
}

// Scores a 'subpole' rank given a context (ctx).
async function subpole(ctx) {
    var success = false;
    let chat = stringChat(ctx);
    let [_, party] = await to(getParty(chat));
    let [e, user] = await to(newUser(ctx.message.from.username, chat));

    if (sameDay(ctx, party.last_set) && party.current == 'pole' && !played(user.last_set)) {
        success = true;
        setParty(chat, 'subpole', ctx.message.date);
        score(ctx.message.from.username, chat, PLATA);

        ctx.telegram.sendMessage(ctx.message.chat.id, `¡Olé!\n\nQue ${ctx.from.first_name} (${ctx.from.username}) ha hecho la subpole. 💃`);
    }

    return success;
}

// Scores a 'bronce' rank given a context (ctx).
async function bronce(ctx) {
    var success = false;
    let chat = stringChat(ctx);
    let [_, party] = await to(getParty(chat));
    let [e, user] = await to(newUser(ctx.message.from.username, chat));

    if (sameDay(ctx, party.last_set) && party.current == 'subpole' && !played(user.last_set)) {
        success = true;
        setParty(chat, 'bronce', ctx.message.date);
        score(ctx.message.from.username, chat, BRONCE);

        ctx.telegram.sendMessage(ctx.message.chat.id, `¡Olé!\n\nQue el/la pringado/a de ${ctx.from.first_name} (${ctx.from.username}) es bronce. 💃`);
    }

    return success;
}

// Replies with the ranking of the context's (ctx) chat.
async function ranking(ctx) {
    let chat = stringChat(ctx);
    let [_, rankingString] = await to(getRanking(chat));
    ctx.replyWithMarkdown(rankingString);
}

/* -------------------------------------------------------------------------- */
/*                              POPULATE DATABASE                             */
/* -------------------------------------------------------------------------- */

// Add user to the database
function addUser(ctx) {
    let chat = stringChat(ctx);
    newUser(ctx.message.from.username, chat);
}

// Add party to the database
function addParty(ctx) {
    let chat = stringChat(ctx);
    newParty(chat);
}

/* -------------------------------------------------------------------------- */
/*                             STRING MANIPULATION                            */
/* -------------------------------------------------------------------------- */

function cases(str) {
    let cases = ""
    for (var i = 0; i < str.length; i++) {
        let c = str.charAt(i);
        cases += `[${c.toUpperCase()}${c.toLowerCase()}]`
    }
    return cases;
}

function msg(str) {
    return new RegExp(`^${cases(str)}$`,'g');
}

function word(str) {
    return new RegExp(`\b${cases(str)}\b`,'g');
}

function contains(str) {
    return new RegExp(`${cases(str)}`,'g');
}

function startsWith(str) {
    return new RegExp(`^${cases(str)}`,'g');
}

function startWord(str) {
    return new RegExp(`^${cases(str)}\b`,'g');
}

function endsWith(str) {
    return new RegExp(`${cases(str)}$`,'g');
}

function endWord(str) {
    return new RegExp(`\b${cases(str)}$`,'g');
}

module.exports = {
    pole,
    subpole,
    bronce,
    addUser,
    addParty,
    ranking,
    msg,
    word,
    endWord
};