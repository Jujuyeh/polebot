/*
 * Bot Game Main Script
 *
 * Author: Jujuyeh
 * License: GNU General Public License version 3.0
 */

/* --------------------------------- IMPORTS -------------------------------- */
import { Telegraf as _Telegraf } from "telegraf";
import { MenuTemplate, MenuMiddleware } from "telegraf-inline-menu";

import pkg from "mongoose";
const { connect } = pkg;

import {
    pole,
    subpole,
    bronce,
    addParty,
    ranking,
    msg,
    endWord,
    word,
    getBusTimes,
    getTramTimes,
    getNearBusTimes,
    getNearTramTimes,
    getNearBike,
    getNearPharmacy,
    getNearWater,
    setLoc,
} from "./lib/index.js";

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
    "jan",
];

/* -------------------------------------------------------------------------- */
/*                                  DATABASE                                  */
/* -------------------------------------------------------------------------- */

connect(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/polebot`,
    {
        useNewUrlParser: true,
    }
)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

/* -------------------------------------------------------------------------- */
/*                                     BOT                                    */
/* -------------------------------------------------------------------------- */

const bot = new _Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
    addParty(ctx);
    bot.telegram.sendMessage(ctx.message.chat.id, "¡Olé!");
});

bot.hears(msg("holi"), (ctx) => {
    ctx.telegram.sendMessage(
        ctx.message.chat.id,
        `Holi ${ctx.from.first_name} :D`
    );
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
    if (ctx.message.text.match(msg("co"))) {
        ctx.replyWithVoice({
            source: "./assets/cacola.mp3",
        });
    } else {
        let randomResponse =
            coResponses[Math.round(Math.random() * (coResponses.length - 1))];
        ctx.reply(randomResponse, {
            reply_to_message_id: ctx.message.message_id,
        });
    }
});

bot.hears(word("pilarica"), (ctx) => {
    ctx.reply("🤮", { reply_to_message_id: ctx.message.message_id });
});

bot.hears(/^[Ss][Aa]+[Rr][Aa]+$/, (ctx) => {
    let firstChar = ctx.message.text.match(/[Ss][Aa]+/)[0].length - 1;
    let secondChar = ctx.message.text.match(/[Rr][Aa]+/)[0].length - 1;
    const charO = "o";
    const charA = "a";
    let response = `g${"o".repeat(firstChar)}s${"a".repeat(secondChar)}`;
    ctx.reply(response, { reply_to_message_id: ctx.message.message_id });
});

bot.hears(/bus[0-9]+/, (ctx) => {
    getBusTimes(ctx);
});

bot.hears(/\/tram/, (ctx) => {
    getTramTimes(ctx);
});

/* -------------------------------- LOCATION -------------------------------- */
const menuTemplate = new MenuTemplate((_) => `Buscar cerca de esa ubicación:`);

const locOptions = {
    "Parada de autobús": (x) => getNearBusTimes(x),
    "Parada de tranvía": (x) => getNearTramTimes(x),
    Bizi: (x) => getNearBike(x),
    Farmacia: (x) => getNearPharmacy(x),
    "Fuentes de agua": (x) => getNearWater(x),
};

menuTemplate.choose("Location Service", Object.keys(locOptions), {
    columns: 2,
    maxRows: 3,
    do: (ctx, key) => {
        locOptions[key](ctx.callbackQuery.message.chat.id);
        return true;
    },
});

const menuMiddleware = new MenuMiddleware("/", menuTemplate);

bot.on("message", (ctx) => {
    if (ctx.message.location && ctx.message.chat.type === "private") {
        setLoc(ctx);
        menuMiddleware.replyToContext(ctx);
    }
});

bot.use(menuMiddleware);

/* -------------------------------------------------------------------------- */
bot.startPolling();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
