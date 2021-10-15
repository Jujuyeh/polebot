/*
 * "Ayuntamiento de Zaragoza" API Information Retreival Library
 *
 * Author: Jujuyeh
 * License: GNU General Public License version 3.0
 */

import request from "request";
import {
    to
} from "await-to-js";

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

const em_weather = {
    "Clear": "☀️",
    "Rain": "🌧",
    "Snow": "❄️",
    "Thunderstorm": "⛈",
    "Drizzle": "🌦",
    "Mist": "🌫",
    "Fog": "🌫",
    "Clouds": "🌥",
    "Tornado": "🌪"
};

let lastLoc = {};

function numToEmoji(n) {
    let result = "";

    while (n > 0) {
        result = em_num[n % 10] + result;
        n = Math.floor(n / 10);
    }
    return result;
}

export function setLoc(ctx) {
    lastLoc[ctx.message.chat.id] = ctx;
}

function getLoc(user) {
    return lastLoc[user];
}

export async function getBusTimes(ctx) {
    let postnumber = parseInt(ctx.message.text.replace(/^\D+/g, ""));
    let msg = "";

    let promise = new Promise((resolve, _) => {
        request({
                method: "GET",
                uri: `https://www.zaragoza.es/sede/servicio/urbanismo-infraestructuras/transporte-urbano/poste-autobus/tuzsa-${postnumber}?rf=html&srsname=wgs84`,
                headers: {
                    accept: "application/json"
                },
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
        msg = `*${stop.title}*\n\n`;

        for (let i = 0; i < stop.destinos.length; i++) {
            let bus = stop.destinos[i];

            msg += `*${bus.linea}*🚍 | ${bus.destino}\n`;
            if (bus.primero != "Sin estimacin.") {
                msg += `    ${bus.primero}\n`;
            }
            if (bus.segundo != "Sin estimacin.") {
                msg += `    ${bus.segundo}\n\n`;
            }
        }
        ctx.replyWithLocation(
            stop.geometry.coordinates[1],
            stop.geometry.coordinates[0]
        );
    }

    ctx.reply(msg, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "Markdown",
    });
}

export async function getTramTimes(ctx) {
    let filter = ctx.message.text
        .replace(/\/tram\b/g, "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
    let msg = "";

    let promise = new Promise((resolve, _) => {
        request({
                method: "GET",
                uri: `https://www.zaragoza.es/sede/servicio/urbanismo-infraestructuras/transporte-urbano/parada-tranvia?rf=html&srsname=wgs84&start=0&rows=50&distance=500`,
                headers: {
                    accept: "application/json"
                },
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
        msg = "El servicio de tiempos de tranvía está caído.";
    } else {
        for (let i = 0; i < stop.rows; i++) {
            let tram = stop.result[i];

            if (tram.destinos && tram.title.includes(filter)) {
                msg += `🚊 *${tram.title}\n`;
                msg += `➡️ ${tram.destinos[0].destino}*\n`;
                msg += `       ${tram.destinos[0].minutos} minuto(s)\n`;
                msg += `       ${tram.destinos[1].minutos} minuto(s)\n\n`;
            }
        }
    }

    if (!msg) {
        msg = "No hay ningún tranvía disponible bajo ese filtro.";
    }

    ctx.reply(msg, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "Markdown",
    });
}

export async function getNearBusTimes(user) {
    let ctx = getLoc(user);
    let lat = ctx.message.location.latitude;
    let lon = ctx.message.location.longitude;

    let msg = "";

    let promise = new Promise((resolve, _) => {
        request({
                method: "GET",
                uri: `https://www.zaragoza.es/sede/servicio/urbanismo-infraestructuras/transporte-urbano/poste-autobus?rf=html&srsname=wgs84&start=0&rows=1&distance=500&point=${lon}%2C${lat}`,
                headers: {
                    accept: "application/json"
                },
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

    if (!stop.result) {
        msg = "El servicio de buses está caído, o no hay paradas cerca.";
    } else {
        stop = stop.result[0];
        let postnumber = parseInt(stop.id.replace(/^\D+/g, ""));

        msg = `*${stop.title}*\n\n`;
        msg += `Para ver los tiempos de buses de esta parada marca /bus${postnumber}\n`;

        ctx.replyWithLocation(
            stop.geometry.coordinates[1],
            stop.geometry.coordinates[0]
        );
    }

    ctx.reply(msg, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "Markdown",
    });
}

export async function getNearTramTimes(user) {
    let ctx = getLoc(user);
    let lat = ctx.message.location.latitude;
    let lon = ctx.message.location.longitude;

    let msg = "";

    let promise = new Promise((resolve, _) => {
        request({
                method: "GET",
                uri: `https://www.zaragoza.es/sede/servicio/urbanismo-infraestructuras/transporte-urbano/parada-tranvia?rf=html&srsname=wgs84&start=0&rows=4&point=${lon}%2C${lat}&distance=1000`,
                headers: {
                    accept: "application/json"
                },
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

    if (!stop.result) {
        msg = "El servicio de tranvía está caído, o no hay paradas cerca.";
    } else {
        let nearest = stop.result[0];
        let nearestId = parseInt(nearest.id);
        let opposite = "";

        if (nearestId % 2 == 0) {
            opposite = `${nearestId - 1}`;
        } else {
            opposite = `${nearestId + 1}`;
        }

        for (let i = 0; i < stop.rows; i++) {
            let tram = stop.result[i];

            if (
                tram && tram.destinos &&
                (tram.id == nearest.id || tram.id == opposite)
            ) {
                msg += `🚊 *${tram.title}\n`;
                msg += `➡️ ${tram.destinos[0].destino}*\n`;
                msg += `       ${tram.destinos[0].minutos} minuto(s)\n`;
                msg += `       ${tram.destinos[1].minutos} minuto(s)\n\n`;

                ctx.replyWithLocation(
                    tram.geometry.coordinates[1],
                    tram.geometry.coordinates[0]
                );
            }
        }
    }

    if (!msg) {
        msg = "No circula ningún tranvía cerca de tí ahora.";
    }

    ctx.reply(msg, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "Markdown",
    });
}

export async function getNearBike(user) {
    let ctx = getLoc(user);
    let lat = ctx.message.location.latitude;
    let lon = ctx.message.location.longitude;

    let msg = "";

    let promise = new Promise((resolve, _) => {
        request({
                method: "GET",
                uri: `https://www.zaragoza.es/sede/servicio/urbanismo-infraestructuras/estacion-bicicleta?rf=html&srsname=wgs84&start=0&rows=1&point=${lon}%2C${lat}&distance=1000`,
                headers: {
                    accept: "application/json"
                },
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

    if (!stop.result) {
        msg = "El servicio de Bizi está caído, o no hay estaciones cerca.";
    } else {
        stop = stop.result[0];
        msg = `*${stop.title}*\n\n`;
        msg += `Bicis disponibles: ${stop.bicisDisponibles}\n`;
        msg += `Anclajes disponibles: ${stop.anclajesDisponibles}\n`;

        ctx.replyWithLocation(
            stop.geometry.coordinates[1],
            stop.geometry.coordinates[0]
        );
    }

    ctx.reply(msg, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "Markdown",
    });
}

export async function getNearPharmacy(user) {
    let ctx = getLoc(user);
    let lat = ctx.message.location.latitude;
    let lon = ctx.message.location.longitude;

    let msg = "";

    let promise = new Promise((resolve, _) => {
        request({
                method: "GET",
                uri: `https://www.zaragoza.es/sede/servicio/farmacia?rf=html&tipo=farmacia&srsname=wgs84&start=0&rows=1&point=${lon}%2C${lat}&distance=1000`,
                headers: {
                    accept: "application/json"
                },
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

    let pharmacy = await promise;
    pharmacy = JSON.parse(pharmacy);

    if (!pharmacy.result) {
        msg = "No se puede obtener una farmacia cercana en estos momentos.";
    } else {
        pharmacy = pharmacy.result[0];
        msg = `*${pharmacy.title}*\n\n`;
        msg += `Dirección: ${pharmacy.calle}\n`;
        msg += `Contacto: ${pharmacy.telefonos}\n`;

        ctx.replyWithLocation(
            pharmacy.geometry.coordinates[1],
            pharmacy.geometry.coordinates[0]
        );
    }

    ctx.reply(msg, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "Markdown",
    });
}

export async function getNearWater(user) {
    let ctx = getLoc(user);
    let lat = ctx.message.location.latitude;
    let lon = ctx.message.location.longitude;

    let msg = "";

    let promise = new Promise((resolve, _) => {
        request({
                method: "POST",
                uri: "http://www.overpass-api.de/api/interpreter",
                body: `[out:json];node[amenity=drinking_water](around:250,${lat},${lon});out;`,
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

    let water = await promise;
    water = JSON.parse(water);

    if (!water.elements) {
        msg = "No hay fuentes de agua cerca.";
        ctx.reply(msg, {
            parse_mode: "Markdown",
            reply_to_message_id: ctx.message.message_id,
        });
    } else {
        msg = "Fuentes de agua más cercanas.";
        ctx.reply(msg, {
            parse_mode: "Markdown",
            reply_to_message_id: ctx.message.message_id,
        });

        for (let i = 0; i < water.elements.length; i++) {
            ctx.replyWithLocation(water.elements[i].lat, water.elements[i].lon);
        }
    }
}


export async function getWeather(ctx) {
    let filter = ctx.message.text.replace(/\/tram\b/g, "").trim()
    let city = "Zaragoza";

    // 'imperial', 'metric' or 'standard' (Fahrenheit, Clesius or Kelvin resp.)
    let units = "metric";
    let lang = "es";
    let msg = "";

    let weather_token = process.env.OPENWEATHER_TOKEN;
    if (!weather_token) return;

    let promise = new Promise((resolve, _) => {
        request({
                method: "GET",
                uri: `http://api.openweathermap.org/data/2.5/weather?q=${city}&lang=${lang}&units=${units}&appid=${weather_token}`
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

    let weather = await promise;
    weather = JSON.parse(weather);
    console.log(weather);

    if (!weather.main) {
        msg = "No es posible conocer el tiempo actualmente.";
    } else {
        let format = (x => {return (+x.toFixed(1)).toLocaleString("es")})

        msg = `${em_weather[weather.weather[0].main]} *${weather.weather[0].description.toUpperCase()}*`;
        msg += ` ${format(weather.main.temp)} °C\n`;
        msg += `    Min: ${format(weather.main.temp_min)} °C\n`;
        msg += `    Max: ${format(weather.main.temp_max)} °C\n`;
        msg += `    Humedad: ${format(weather.main.humidity)}%\n`;
        msg += `    Presión: ${format(weather.main.pressure)} mbar\n`;
    }
    ctx.reply(msg, {
        parse_mode: "Markdown",
        reply_to_message_id: ctx.message.message_id,
    });
}