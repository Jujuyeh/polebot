/*
 * Database Middleware Library
 *
 * Author: Jujuyeh
 * License: GNU General Public License version 3.0
 */

/* --------------------------------- IMPORTS -------------------------------- */
import { newParty, newUser } from "../database/user/index.js";
import { stringChat } from "./strings.js";

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
