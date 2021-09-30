/*
 * Database Middleware Library
 *
 * Author: Jujuyeh
 * License: GNU General Public License version 3.0
 */

/* --------------------------------- IMPORTS -------------------------------- */
import { newParty, newUser } from "../database/user/index.js";

/* ---------------------------- AUXILIAR METHODS ---------------------------- */
// Returns a chat ID casted to a valid Mongo ObjectID as String.
export function stringChat(ctx) {
    return Math.abs(ctx.message.chat.id).toString().padStart(24, "0");
}

/* -------------------------------------------------------------------------- */
/*                              POPULATE DATABASE                             */
/* -------------------------------------------------------------------------- */

// Add user to the database
export function addUser(ctx) {
    let chat = stringChat(ctx);
    newUser(ctx.message.from.username, chat);
}

// Add party to the database
export function addParty(ctx) {
    let chat = stringChat(ctx);
    newParty(chat);
}
