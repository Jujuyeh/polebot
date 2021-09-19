/*
 * String Manipulation Library
 *
 * Author: Jujuyeh
 * License: GNU General Public License version 3.0
 */

/* -------------------------------------------------------------------------- */
/*                             STRING MANIPULATION                            */
/* -------------------------------------------------------------------------- */
function isLetter(c) {
    return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z");
}

export function cases(str) {
    let cases = "";
    for (var i = 0; i < str.length; i++) {
        let c = str.charAt(i);
        if (isLetter(c)) {
            cases += `[${c.toUpperCase()}${c.toLowerCase()}]`;
        }
    }
    return cases;
}

export function msg(str) {
    return new RegExp(`^${cases(str)}$`, "g");
}

export function word(str) {
    return new RegExp(`\\b${cases(str)}\\b`, "g");
}

export function contains(str) {
    return new RegExp(`${cases(str)}`, "g");
}

export function startsWith(str) {
    return new RegExp(`^${cases(str)}`, "g");
}

export function startWord(str) {
    return new RegExp(`^${cases(str)}\\b`, "g");
}

export function endsWith(str) {
    return new RegExp(`${cases(str)}$`, "g");
}

export function endWord(str) {
    return new RegExp(`\\b${cases(str)}$`, "g");
}

// Returns a chat ID casted to a valid Mongo ObjectID as String.
export function stringChat(ctx) {
    return Math.abs(ctx.message.chat.id).toString().padStart(24, "0");
}
