/*
 * Bot Game Main Script
 *
 * Author: Jujuyeh
 * License: GNU General Public License version 3.0
 */

/* --------------------------------- IMPORTS -------------------------------- */
const Telegraf = require('telegraf');
const mongoose = require('mongoose');
const pole = require("./lib").pole;
const subpole = require("./lib").subpole;
const bronce = require("./lib").bronce;
const addParty = require("./lib").addParty;
const addUser = require("./lib").addUser;
const ranking = require("./lib").ranking;
const msg = require("./lib").msg;
const endWord = require("./lib").endWord;
const word = require("./lib").word;

/* -------------------------------------------------------------------------- */
/*                                   GLOBALS                                  */
/* -------------------------------------------------------------------------- */

// All available responses for "*co" messages.
const coResponses = [
    "pón",
    "smico",
    "jones",
    "lesterol",
    "modín",
    "ncilio de Trento",
    "nfinamiento",
    "vid",
    "baya",
    "jan"
]

/* -------------------------------------------------------------------------- */
/*                                  DATABASE                                  */
/* -------------------------------------------------------------------------- */

mongoose
    .connect(
        `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/polebot`, {
            useNewUrlParser: true
        }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

/* -------------------------------------------------------------------------- */
/*                                     BOT                                    */
/* -------------------------------------------------------------------------- */

const bot = new Telegraf.Telegraf(process.env.BOT_TOKEN);

bot.command('start', ctx => {
    addParty(ctx);
    bot.telegram.sendMessage(ctx.message.chat.id, '¡Olé!');
});

bot.hears(msg("holi"), (ctx) => {
    ctx.telegram.sendMessage(ctx.message.chat.id, `Holi ${ctx.from.first_name} :D`)
});

bot.hears(msg("pole"), (ctx) => {
    pole(ctx);
});

bot.hears(msg("oro"), (ctx) => {
    pole(ctx);
});

bot.hears(msg("subpole"), (ctx) => {
    subpole(ctx);
});

bot.hears(msg("plata"), (ctx) => {
    subpole(ctx);
});

bot.hears(msg("bronce"), (ctx) => {
    bronce(ctx);
});

bot.hears(msg("fail"), (ctx) => {
    bronce(ctx);
});

bot.hears(msg("ranking"), (ctx) => {
    ranking(ctx);
});

bot.hears(endWord("co"), (ctx) => {
    let randomResponse = coResponses[Math.round(Math.random()*(coResponses.length - 1))];
    ctx.reply(randomResponse, { reply_to_message_id: ctx.message.message_id });
});

bot.hears(word("pilarica"), (ctx) => {
    ctx.reply("🤮", { reply_to_message_id: ctx.message.message_id });
});

bot.hears(/^[Ss][Aa]+[Rr][Aa]+$/, (ctx) => {
    let charRepeatFirst = ctx.message.text.match(/[Ss][Aa]+/)[0].length - 1;
    let charRepeatSecond = ctx.message.text.match(/[Rr][Aa]+/)[0].length - 1;
    const charO = "o";
    const charA = "a";
    let response = `g${"o".repeat(charRepeatFirst)}s${"a".repeat(charRepeatSecond)}`;
    ctx.reply(response, { reply_to_message_id: ctx.message.message_id });
});

bot.startPolling();

/* -------------------------------------------------------------------------- */
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))