/*
 * "Ayuntamiento de Zaragoza" API Information Retreival Library
 *
 * Author: Jujuyeh
 * License: GNU General Public License version 3.0
 */

import request from "request";
import { to } from "await-to-js";

const em_zero = "0️⃣";
const em_one = "1️⃣";
const em_two = "2️⃣";
const em_three = "3️⃣";
const em_four = "4️⃣";
const em_five = "5️⃣";
const em_six = "6️⃣";
const em_seven = "7️⃣";
const em_eight = "8️⃣";
const em_nine = "9️⃣";
const em_num = [
    em_zero,
    em_one,
    em_two,
    em_three,
    em_four,
    em_five,
    em_six,
    em_seven,
    em_eight,
    em_nine,
];

function numToEmoji(n) {
    let result = "";

    while (n > 0) {
        console.log(n);
        result = em_num[n % 10] + result;
        n = Math.floor(n / 10);
    }
    console.log(result);

    return result;
}

export async function getBusTimes(ctx) {
    let postnumber = parseInt(ctx.message.text.replace(/^\D+/g, ""));
    let msg = "";

    let promise = new Promise((resolve, _) => {
        request(
            {
                method: "GET",
                uri: `https://www.zaragoza.es/sede/servicio/urbanismo-infraestructuras/transporte-urbano/poste-autobus/tuzsa-${postnumber}?rf=html&srsname=wgs84`,
                headers: { accept: "application/json" },
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    resolve("{}");
                }
            }
        );
    });

    let stop = await promise;
    stop = JSON.parse(stop);

    if (Object.keys(stop).length == 0) {
        msg = "El servicio de buses está caído, o la parada no existe.";
    } else {
        msg = `${stop.title}\n\n`;

        for (let i = 0; i < stop.destinos.length; i++) {
            let bus = stop.destinos[i];
            let line = parseInt(bus.linea);

            msg += `${numToEmoji(line)} ${bus.destino}\n`;
            if (bus.primero != "Sin estimacin.") {
                msg += `    ${bus.primero}\n`;
            }
            if (bus.segundo != "Sin estimacin.") {
                msg += `    ${bus.segundo}\n\n`;
            }
        }
    }

    ctx.reply(msg, { reply_to_message_id: ctx.message.message_id });
}
