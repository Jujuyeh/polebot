/*
 * Bot Game Main Script
 *
 * Author: Jujuyeh
 * License: GNU General Public License version 3.0
 */

/* --------------------------------- IMPORTS -------------------------------- */
import { Bot, InputFile } from "grammy";
import { MenuTemplate, MenuMiddleware } from "grammy-inline-menu";

import pkg from "mongoose";
const { connect } = pkg;

import {
    pole,
    subpole,
    bronce,
    addParty,
    ranking,
    getBusTimes,
    getTramTimes,
    getNearBusTimes,
    getNearTramTimes,
    getNearBike,
    getNearPharmacy,
    getNearWater,
    getWeather,
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
ℹ️ℹ️ℹ️ *Ayuda con Polebot* ℹ️ℹ️ℹ️

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
¿Porqué es esto importante para ti? Este tipo de bots procesa *todos* los mensajes de los grupos en los que se encuentra. Si no te fías, haces bien, y por eso mismo existe este bot que al ser libre demuestra un uso lícito de toda información procesada. 

Estoy disponible en https://github.com/Jujuyeh/polebot.
`;

const rePole =      /^pole$|^oro$/i;
const reSubpole =   /^subpole$|^plata$/i;
const reFail =      /^fail$|^bronce$/i;
const reHoli =      /^holi$/i;
const reHelp =      /^\/help$|^\/ayuda$/i;
const reRanking =   /^ranking$/i;
const reCo =        /\bco$/i;
const reSara =      /^sa+ra+$/i;
const reBus =       /^\/bus\d+$/;
const reTram =      /^\/tram/;
const reWeather =   /^\/tiempo/;


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

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
    addParty(ctx);
    ctx.reply("¡Olé!");
});

bot.hears(reHoli, (ctx) => {
    ctx.reply(`Holi ${ctx.from.first_name} :D`);
});

bot.command("ayuda", (ctx) => {
    ctx.reply(help, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "Markdown",
    });
});

bot.command("help", (ctx) => {
    ctx.reply(help, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "Markdown",
    });
});

bot.hears(rePole, (ctx) => pole(ctx));
bot.hears(reSubpole, (ctx) => subpole(ctx));
bot.hears(reFail, (ctx) => bronce(ctx));
bot.hears(reRanking, (ctx) => ranking(ctx));

bot.hears(reCo, (ctx) => {
    if (ctx.message.text.match(/^co$/i)) {
        ctx.replyWithVoice(new InputFile("./assets/cacola.mp3"));
    } else {
        let randomResponse =
            coResponses[Math.round(Math.random() * (coResponses.length - 1))];
        ctx.reply(randomResponse, {
            reply_to_message_id: ctx.message.message_id,
        });
    }
});

bot.hears(reSara, (ctx) => {
    let firstChar = ctx.message.text.match(/sa+/i)[0].length - 1;
    let secondChar = ctx.message.text.match(/ra+/i)[0].length - 1;
    const charO = "o";
    const charA = "a";
    let response = `g${"o".repeat(firstChar)}s${"a".repeat(secondChar)}`;
    ctx.reply(response, { reply_to_message_id: ctx.message.message_id });
});

bot.hears(reBus, (ctx) => getBusTimes(ctx));
bot.hears(reTram, (ctx) => getTramTimes(ctx));
bot.hears(reWeather, (ctx) => getWeather(ctx));

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
bot.start();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
