/*
 * Pole Game Library
 *
 * Author: Jujuyeh
 * License: GNU General Public License version 3.0
 */

/* --------------------------------- IMPORTS -------------------------------- */
import {
    newUser,
    setParty,
    score,
    getRanking,
    getParty,
} from "../database/user/index.js";
import { stringChat } from "./db.js";
import { to } from "await-to-js";

/* --------------------------------- GLOBALS -------------------------------- */
const ORO = 3.0;
const PLATA = 1.0;
const BRONCE = 0.5;

const TIMEZONE = 2.0 * 60 * 60; // UTC+2

/* ---------------------------- AUXILIAR METHODS ---------------------------- */
// Compares if the date of the context's (ctx) message is the same as (last_set)
function sameDay(ctx, last_set) {
    let d1 = new Date((ctx.message.date + TIMEZONE) * 1000);
    let d2 = new Date(last_set * 1000);

    console.log("sameDay", d1, d2);

    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

// Compares if (last_set) is in today.
function played(last_set) {
    let d1 = new Date();
    d1 = new Date(d1.getTime() + (TIMEZONE * 1000));
    let d2 = last_set;

    console.log("played", d1, d2);

    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

/* -------------------------------------------------------------------------- */
/*                               POLE FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

// Scores a 'pole' rank given a context (ctx).
export async function pole(ctx) {
    var success = false;
    let chat = stringChat(ctx);
    let [_, party] = await to(getParty(chat));
    let [e, user] = await to(newUser(ctx.message.from.username, chat));

    if (!sameDay(ctx, party.last_set) && !played(user.last_set)) {
        success = true;
        setParty(chat, "pole", ctx.message.date + TIMEZONE);
        score(
            ctx.message.from.username,
            chat,
            ORO,
            ctx.message.date + TIMEZONE
        );

        ctx.reply(
            `¡Olé!\n\nQue ${ctx.from.first_name} (${ctx.from.username}) ha hecho la pole. 💃`
        );
    }

    return success;
}

// Scores a 'subpole' rank given a context (ctx).
export async function subpole(ctx) {
    var success = false;
    let chat = stringChat(ctx);
    let [_, party] = await to(getParty(chat));
    let [e, user] = await to(newUser(ctx.message.from.username, chat));

    if (
        sameDay(ctx, party.last_set) &&
        party.current == "pole" &&
        !played(user.last_set)
    ) {
        success = true;
        setParty(chat, "subpole", ctx.message.date + TIMEZONE);
        score(
            ctx.message.from.username,
            chat,
            PLATA,
            ctx.message.date + TIMEZONE
        );

        ctx.reply(
            `¡Olé!\n\nQue ${ctx.from.first_name} (${ctx.from.username}) ha hecho la subpole. 💃`
        );
    }

    return success;
}

// Scores a 'bronce' rank given a context (ctx).
export async function bronce(ctx) {
    var success = false;
    let chat = stringChat(ctx);
    let [_, party] = await to(getParty(chat));
    let [e, user] = await to(newUser(ctx.message.from.username, chat));

    if (
        sameDay(ctx, party.last_set) &&
        party.current == "subpole" &&
        !played(user.last_set)
    ) {
        success = true;
        setParty(chat, "bronce", ctx.message.date + TIMEZONE);
        score(
            ctx.message.from.username,
            chat,
            BRONCE,
            ctx.message.date + TIMEZONE
        );

        ctx.reply(
            `¡Olé!\n\nQue el/la pringado/a de ${ctx.from.first_name} (${ctx.from.username}) es bronce. 💃`
        );
    }

    return success;
}

// Replies with the ranking of the context's (ctx) chat.
export async function ranking(ctx) {
    let chat = stringChat(ctx);
    let [_, rankingString] = await to(getRanking(chat));
    ctx.reply(rankingString, { parse_mode: "Markdown" });
}
