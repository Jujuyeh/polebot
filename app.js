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

bot.hears('holi', (ctx) => {
    ctx.telegram.sendMessage(ctx.message.chat.id, `Holi ${ctx.from.first_name} :D`)
});

bot.hears(/^[Pp][Oo][Ll][Ee]$/, (ctx) => {
    pole(ctx);
});

bot.hears(/^[Ss][Uu][Bb][Pp][Oo][Ll][Ee]$/, (ctx) => {
    subpole(ctx);
});

bot.hears(/^[Bb][Rr][Oo][Nn][Cc][Ee]$/, (ctx) => {
    bronce(ctx);
});

bot.hears(/[Rr][Aa][Nn][Kk][Ii][Nn][Gg]$/, (ctx) => {
    ranking(ctx);
});

bot.hears(/\b[Cc][Oo]\b/, (ctx) => {
    ctx.reply("Co", { reply_to_message_id: ctx.message.message_id });
});

bot.startPolling();

/* -------------------------------------------------------------------------- */
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))