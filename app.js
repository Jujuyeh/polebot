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

// Help message
const help = `
ℹ️ℹ️ℹ️ *Auyda con Polebot* ℹ️ℹ️ℹ️

Con este bot podrás jugar a la _pole_, añádelo a un grupo para jugar. También te permite consultar diferentes servicios de Zaragoza, como tiempos de paso de buses, tranvía y más.


🎲 Pole 🎲

Todos los días, a partir de las 00:00, se inicia una nueva partida de _Pole_. Compite con tus amigos por ser el primero en decir "pole" y suma puntos en el ránking. Estos son los puestos por los que se compiten (en el orden mencionado):

- '\`pole\`' u '\`oro\`': 3 puntos
- '\`subpole\`' o '\`plata\`': 1 punto
- '\`fail\`' o '\`bronce\`': 0,5 puntos

Puedes consultar el puntuaje actual con \`ranking\`.


🗺 *Tiempos de bus* 🗺

Consulta los tiempos de paso de los Urbanos de Zaragoza dado el número de poste. Usa \`/busXXXX\` donde _XXXX_ es el número de poste.
Ejemplo: /bus340

Consejo: Puedes pulsar la orden ya escrita, no hace falta que vuelvas a escribirla.


🗺 *Tiempos de tranvía* 🗺

Consulta los tiempos de paso del Tranvía de Zaragoza dado un nombre de parada, o parte de éste. Usa \`/tram XXXX\` donde _XXXX_ es un filtro de búsqueda. Si no se provee de ningún filtro de búsqueda, se devolverá una lista con todas las paradas.
Ejemplo: \`/tram españa\`


🗺 *Servicios de ubicación* 🗺

Sólo disponible en conversaciones privadas. Envía tu ubicación o cualquiera en Zaragoza, y un menú te permitirá buscar el punto de interés más cercano a dicha ubicación. Actualmente se pueden consultar:

📍 Parada de autobús más cercana.
📍 Parada de tranvía más cercana.
📍 Estación de Bizi más cercana.
📍 Farmacia más cercana.
📍 Todas las fuentes de agua disponibles a menos de 250 metros.


🌈 *¿Bot libre?* 🌈

Este bot es _libre_, esto quiere decir que el código está a tu disposición para examinarlo, hacer una copia y mejorarla. Consulta con más detalle la licencia [GNU General Public License version 3](https://www.gnu.org/licenses/gpl-3.0.en.html).
¿Porqué es esto importante para tí? Este tipo de bots procesa *todos* los mensajes de los grupos en los que se encuentra. Si no te fías, haces bien, y por eso mismo existe este bot que al ser libre demuestra un uso lícito de toda información procesada. 

Estoy disponible en https://github.com/Jujuyeh/polebot.
`;

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

bot.hears(msg("ayuda"), (ctx) => {
    ctx.replyWithMarkdown(help, { reply_to_message_id: ctx.message.message_id });
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
