require("dotenv").config();
const axios = require("axios");
const cron = require("node-cron");
const crypto = require("crypto");
const Parser = require("expr-eval").Parser;
const fs = require("fs");
const path = require("path");
const { App } = require("@slack/bolt");
const range = (length) => Array.from({ length }, (_, i) => i);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

//key stuff
const KEY_FILE = path.join(__dirname, "key.json");

let key;
try {
    if (fs.existsSync(KEY_FILE)) {
        key = JSON.parse(fs.readFileSync(KEY_FILE, "utf8"));
        console.log("loaded key, wowie :)");
    } else {
        throw new Error("the json file is probally empty...");
    }
} catch (e) {
    key = [
      "a", "A", "b", "B", "c", "C", "d", "D", "e", "E", "f", "F", "g", "G", 
      "h", "H", "i", "I", "j", "J", "k", "K", "l", "L", "m", "M", "n", "N", 
      "o", "O", "p", "P", "q", "Q", "r", "R", "s", "S", "t", "T", "u", "U", 
      "v", "V", "w", "W", "x", "X", "y", "Y", "z", "Z"
    ];
    fs.writeFileSync(KEY_FILE, JSON.stringify(key), "utf8");
}

// guess what this does.
function saveKeyToFile() {
    fs.writeFileSync(KEY_FILE, JSON.stringify(key), "utf8");
    console.log("updated cipher");
}

//log for coppy + paste

const LOG_FILE = path.join(__dirname, "log.json");

let log;
try {
    if (fs.existsSync(LOG_FILE)) {
        log = JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));
        console.log("loaded log, wowie :)");
    } else {
        throw new Error("the json file is probally empty...");
    }
} catch (e) {
    log = [];
    fs.writeFileSync(LOG_FILE, JSON.stringify(log), "utf8");
}

// guess what this does.
function saveLogToFile() {
    fs.writeFileSync(LOG_FILE, JSON.stringify(log), "utf8");
    console.log("updated log");
}

const morseCodeMap = {
  "a": ".-",    "b": "-...",  "c": "-.-.",  "d": "-..",
  "e": ".",     "f": "..-.",  "g": "--.",   "h": "....",
  "i": "..",    "j": ".---",  "k": "-.-",   "l": ".-..",
  "m": "--",    "n": "-.",    "o": "---",   "p": ".--.",
  "q": "--.-",  "r": ".-.",   "s": "...",   "t": "-",
  "u": "..-",   "v": "...-",  "w": ".--",   "x": "-..-",
  "y": "-.--",  "z": "--..",
  
  "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..",
  "9": "----.", "0": "-----", " ": "/"
};

const iMorseCodeMap = Object.fromEntries(
  Object.entries(morseCodeMap).map(([letter, morse]) => [morse, letter])
);

function shuffleKey() {
    for (let i = key.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        let temp = key[i];
        key[i] = key[j];
        key[j] = temp;
    };
    const path = require("path");
    console.log(`[Cron] Key automatically shuffled. New order: ${key.join("")}`);
};

// 0 0 * * * === Minute 0, Hour 0, Day *, Month *, Day of week *
cron.schedule("0 0 * * *", () => {
    shuffleKey();
}, {
    scheduled: true,
    timezone: "America/New_York" // Change this to your preferred local timezone!
});

app.command("/pug-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();

app.command("/pug-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Pug Bot - Cryptography & Utility Bot*\nStuff you can do:\n"
        }
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Core: *\n" +
                "- `/pug-help`        - displays this.\n" +
                "- `/pug-ping`        - pings the bot.\n" +
                "- `/pug-echo [text]` - just says the text\n"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Cryptography & Math:*\n" +
                "- `/e$ [text]`           - Custom differential encoder.\n" +
                "- `/d$ [text]`           - Custom differential decoder.\n" +
                "- `/sk$ [optional: ...]` - shuffles, or sets the key used for /e$ and /d$.\n" +
                "- `/rk`                  - resets key.\n" +
                "- `/hash$ [text]`        - hashes the text.\n" +
                "- `/calc$ [expression]`  - evaluates a expression\n" +
                "- `/vigenere$`           - another cipher.\n" +
                "- `/rail$`               - oh,imo and guess what another one.\n" +
                "- `/b64$`                - wait, there's another ciphers.\n" +
                "- `/u$`                   - converts between string and unicode (use ',').\n"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*API Stuff:*\n" +
                "- `/pug-catfact` - gives you a fun cat fact.\n" +
                "- `/pug-dogfact` - gives you a fun dog fact.\n" +
                "- `/pug-joke`    - tells a joke.\n" +
                "- `/translate$`  - translates text\n" +
                "- `/pug-weather` - fetches weather for that reigon\n" +
                "- `/pug-remind`  - reminds you of a msg in x minutes\n" +
                "- `/pug-rate`     - get the rate of currency"
        }
      }
    ]
  });
});

app.command("/pug-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});

app.command("/pug-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text:
`${response.data.setup}

${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});

app.command("/pug-dogfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://dogapi.dog/api/v2/facts?limit=1");
    await respond({text:`${response.data.data[0].attributes.body}`});
  } catch (err) {
    await respond({ text: "Failed to fetch a fact." });
  }
});

app.command("/pug-echo", async ({command, ack, respond}) => {
    await ack();
    const I = command.text;
    if (!I) {
        await respond({text:"type something!"});
        return;
    };
    await respond({text:I})
});

app.command("/e$", async ({ command, ack, respond }) => {
    await ack();
    const input = command.text; 
    if (!input) {
        await respond({ text: "can't encode nothing." });
        return;
    }
    let chars = input.split(""); 
    let E = [chars[0]]; 
    for (let i = 1; i < chars.length; i++) { 
        let x = chars[i];
        let y = chars[i - 1];
        let X = key.indexOf(x);
        let Y = key.indexOf(y);
        // keeps symbols the same
        if (X == -1 || Y == -1) {
            E.push(x);
            continue;
        }
        let z = (((X - Y) % key.length) + key.length) % key.length;
        E.push(key[z]);
    }
    await respond({ text: `encoded msg: ${E.join("")}` });
});

app.command("/d$", async ({ command, ack, respond }) => {
    await ack();
    const input = command.text; 
    if (!input) {
        await respond({ text: "can't decode nothing." });
        return;
    }
    let chars = input.split(""); 
    let D = [chars[0]];
    for (let i = 1; i < chars.length; i++) { 
        let x = chars[i];
        let y = D[i-1];
        let X = key.indexOf(x);
        let Y = key.indexOf(y);
        // keeps symbols the same
        if (X == -1 || Y == -1) {
            D.push(x);
            continue;
        }
        let z = (((X + Y) % key.length) + key.length) % key.length;
        D.push(key[z]);
    }
    await respond({ text: `decoded msg: ${D.join("")}` });
});

app.command("/sk$", async ({command, ack, respond }) => {
    await ack();
    const input = command.text;

    if (!input) {
        shuffleKey();
        await respond({ 
            text: `Key has been shuffled.\nNew Key Layout: \`${key.join("")}\`` 
        });
    } else {
        key = input.split(",")
        const path = require("path");
        await respond({ 
            text: `Key has been set.\nNew Key Layout: \`${key.join("")}\`` 
        });
    }
});

app.command("/rk", async ({ack, respond}) => {
    key = ["a", "A", "b", "B", "c", "C", "d", "D", "e", "E", "f", "F", "g", "G", "h", "H", "i", "I", "j", "J", "k", "K", "l", "L", "m", "M", "n", "N", "o", "O", "p", "P", "q", "Q", "r", "R", "s", "S", "t", "T", "u", "U", "v", "V", "w", "W", "x", "X", "y", "Y", "z", "Z"];
    saveKeyToFile();
    await respond({ 
      text: `Key has been reset.\nNew Key Layout: \`${key.join("")}\`` 
    });
});

app.command("/hash$", async ({ command, ack, respond }) => {
    await ack();
    const input = command.text;
    if (!input) return await respond("#nothing to hash.");

    // SHA-256 hash
    const hash = crypto.createHash("sha256").update(input).digest("hex");
    await respond({ text: `*SHA-256 Hash:* \`${hash}\`` });
});

app.command("/calc$", async ({ command, ack, respond }) => {
    await ack();
    const input = command.text;
    if (!input) return await respond("^0+h!^& +0 (@|(u|@+3.");

    const result = Parser.evaluate(input);
    await respond({ text: `*result:* \`${result}\`` });
});

app.command("/ecaesar$", async ({ command, ack, respond }) => {
    await ack();
    let input = command.text;
    if (!input) {
        await respond({ text: "oh no your empty msg is like a stab..." });
        return;
    }
    // get num and msg seperated
    const [num, ...messageP] = input.split(" "); ;
    const shift = parseInt(num, 10);
    let message = messageP.join(" ");
    if (isNaN(shift) || !message) {
        await respond({ text: "are you trying to `poison` me?" });
        return;
    }

    message = message.slice(0, shift) + message.slice(shift + 1);
    await respond({ text: `encoded msg: "${message}"` });
});

app.command("/dcaesar$", async ({ command, ack, respond }) => {
    await ack();
    let input = command.text;
    if (!input) {
        await respond({ text: "oh no your empty msg is like a stab..." });
        return;
    }
    // get num and msg seperated
    const [num, ...messageP] = input.split(" ");
    const shift = parseInt(num, 10);
    let message = messageP.join(" ");
    if (isNaN(shift) || !message) {
        await respond({ text: "are you trying to `poison` me?" });
        return;
    }

    message = message.slice(shift + 1) + message.slice(0, shift);
    await respond({ text: `encoded msg: "${message}"` });
});

app.command("/morse$", async ({ command, ack, respond }) => {
    await ack();
    let input = command.text;
    if (!input) {
        await respond({ text: ".__. , really nothing to encode/decode :(" });
        return;
    }
    if (input[0] == "E" || input[0] == "D") {
        let [Type, ...input] = input.split(" ")
    };
    const chars = input.toLowerCase().split("");
    let R = [];

    for (let char of chars) {
        if (morseCodeMap[char]) {
            if (Type && Type == "D") {
                R.push(imorseCodeMap[char]);
            } else {
                R.push(morseCodeMap[char]);
            }
        } else {
            R.push(char);
        };
    };

    await respond({ text: `*Morse Code:* \`${R.join(" ")}\`` });
});

app.command("/translate$", async ({ command, ack, respond }) => {
    await ack();
    let input = command.text;
    if (!input) {
        await respond({ text: "type something..." });
        return;
    }
    const [currentLang, targetLang, ...messageParts] = input.split(" ");
    const textToTranslate = messageParts.join(" ");
    if (!textToTranslate) {
        await respond({ text: "hmm, that isn't quite right." });
        return;
    } else if (targetLang.length != 2 || currentLang.length != 2) {
        await respond({ text: "languge selection should be shortened to two charaters.\nFor ex. english is en" });
        return;
    }

    try {
        // uses free MyMemory API
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${currentLang}|${targetLang}`;
        const response = await axios.get(url);
        const translatedText = response.data.responseData.translatedText;
        await respond({ 
            text: `*Translation (${targetLang.toUpperCase()}):* \`${translatedText}\`` 
        });
    } catch (err) {
        console.error(err);
        await respond({ text: "you or the API encountured an error. Yipee..." });
    }
});

app.command("/coppy$", async ({command, ack, respond}) => {
    await ack();
    let input = command.text;
    if(!input) {return await respond({ text: "you can't coppy nothing." });};
    log.push(input);
    saveLogToFile();
    await respond({ text: `you coppied: ${input}, id:${log.length-1}` });
});

app.command("/paste$", async ({command, ack, respond}) => {
    await ack();
    let input = command.text;
    if(!input) {input = log.length-1;};
    R = log[parseInt(input)]
    await respond({ text: `loaded text: ${R}, id:${input}` });
});

app.command("/pug-weather", async ({ command, ack, respond }) => {
    await ack();
    const city = command.text;
    if (!city) {
        await respond({ text: "add city." });
        return;
    }
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoResponse = await axios.get(geoUrl);
        if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
            await respond({ text: `"${city}" doesn't exist.` });
            return;
        };
        const { latitude, longitude, name, country, admin1 } = geoResponse.data.results[0];
        const region = admin1 ? `${name}, ${admin1}, ${country}` : `${name}, ${country}`;
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
        const weatherResponse = await axios.get(weatherUrl);
        const current = weatherResponse.data.current;
        const temp = current.temperature_2m;
        const humidity = current.relative_humidity_2m;
        const wind = current.wind_speed_10m;
        const R = `*Weather Report for ${region}*\n` +
                       `- Temperature: ${temp}'F\n` +
                       `- Humidity: ${humidity}%\n` +
                       `- Wind Speed: ${wind} mph`;
        await respond({ text: R });
    } catch (err) {
        console.error(err);
        await respond({ text: "The API had an error." });
    }
});

app.command("/pug-remind", async ({ command, ack, respond, client }) => {
    await ack();
    const input = command.text;
    if (!input) {
        await respond({ text: "no input :(" });
        return;
    };

    const parts = input.split(" ");
    const minutes = parseFloat(parts[0]);
    const message = parts.slice(1).join(" ");

    if (!minutes || minutes <= 0 || !message) {
        await respond({ text: "quit trying to break me." });
        return;
    };

    await respond({ text: `message: "${message}"\nTime left: ${minutes} minutes` });
    setTimeout(async () => {
        try {
            await client.chat.postMessage({
                channel: command.channel_id,
                user: command.user_id,
                text: `<@${command.user_id}> *Reminder:* ${message}`
            });
        } catch (err) {
            console.error("error with msg: ", err);
        };
    }, minutes * 60_000);
});

app.command("/pug-rate", async ({ command, ack, respond }) => {
    await ack();
    const input = command.text;
    if (!input) {
        await respond({ text: "this isn't a stanalond command" });
        return;
    };
    const [amountS, fromCurrency, toCurrency] = input.split(" ");
    const amount = parseFloat(amountS);
    if (!amount || !fromCurrency || !toCurrency) {
        await respond({ text: "Format is wrong" });
        return;
    };
    try {
        const url = `https://open.er-api.com/v6/latest/${fromCurrency.toUpperCase()}`;
        const response = await axios.get(url);
        if (response.data.result === "error") {
            await respond({ text: `error with: ${fromCurrency} curreny` });
            return;
        };
        const rate = response.data.rates[toCurrency.toUpperCase()];
        if (!rate) {
            await respond({ text: `this currency: "${toCurrency}" is not recognized.` });
            return;
        };
        const converted = (amount * rate).toFixed(2);
        await respond({ 
            text: `*Exchange Conversion:*\n` + 
            `${amount} ${fromCurrency.toUpperCase()} = *${converted} ${toCurrency.toUpperCase()}*` 
        });
    } catch (err) {
        console.error(err);
        await respond({ text: "API is bussy currently, try again later." });
    };
});

app.command("/vigenere$", async ({ command, ack, respond }) => {
    await ack();
    const input = command.text;
    if (!input) {
        await respond({ text: "this command needs an input" });
        return;
    }
    const parts = input.split(" ");
    const mode = parts[0].toUpperCase();
    let VKey = parts[1];
    const message = parts.slice(2).join(" ");
    if ((mode !== "E" && mode !== "D") || !VKey || !message) {
        await respond({ text: "wrong format" });
        return;
    }
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    let keyIndex = 0;
    let result = [];
    VKey = VKey.toLowerCase().replace(/[^a-z]/g, "");
    if (VKey.length === 0) {
        await respond({ text: "your key, must be letter's only." });
        return;
    }
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        let Index = alphabet.indexOf(char.toLowerCase());
        if (Index === -1) {
            result.push(char);
            continue;
        };
        let shift = alphabet.indexOf(VKey[Index % VKey.length]);
        if (mode === "D") shift = (26 - shift) % 26;
        let rc = alphabet[(Index + shift) % 26]
        result.push((char === char.toUpperCase()) ? rc.toUpperCase() : rc);
        Index++;
    }
    await respond({ text: `*${mode === "E" ? "Encoded" : "Decoded"}:* \`${result.join("")}\`` });
});

app.command("/rail$", async ({ command, ack, respond }) => {
    await ack();
    const input = command.text;
    if (!input) {
        await respond({ text: "Usage: `/rail$ [E/D] [rails] [message]`\nExample: `/rail$ E 3 hello`" });
        return;
    }
    const parts = input.split(" ");
    const mode = parts[0].toUpperCase();
    const rails = parseInt(parts[1], 10);
    const message = parts.slice(2).join(" ");

    if ((mode != "E" && mode != "D") || isNaN(rails) || rails < 2 || !message) {
        await respond({ text: "wrog notation" });
        return;
    } else if (mode === "E") {
        let f = Array.from({ length: rails }, () => []);
        let r = 0;
        let d = 1;

        for (let char of message) {
            f[r].push(char);
            r += d;
            if (r == 0 || r == rails - 1) d *= -1;
        };
        await respond({ text: `*Encoded:* \`${f.flat().join("")}\`` });
    } else {
        let p = Array.from({ length: rails }, () => Array(message.length).fill(null));
        let r = 0;
        let d = 1;
        for (let i = 0; i < message.length; i++) {
            p[r][i] = "*";
            r += d;
            if (r == 0 || r == rails - 1) d *= -1;
        }
        let index = 0;
        for (let R = 0; R < r; R++) {
            for (let c = 0; c < message.length; c++) {
                if (p[R][c] == "*" && index < message.length) {
                    p[R][c] = message[index++];
                };
            };
        };
        let decoded = [];
        r = 0;
        d = 1;
        for (let i = 0; i < message.length; i++) {
            decoded.push(p[r][i]);
            r += d;
            if (r == 0 || r == rails - 1) d *= -1;
        };
        await respond({ text: `*Rail Fence Decoded:* \`${decoded.join("")}\`` });
    }
});

app.command("/b64$", async ({ command, ack, respond }) => {
    await ack();
    const input = command.text;
    if (!input) {
        await respond({ text: "64__64. also add an input" });
        return;
    }
    const mode = input.charAt(0).toUpperCase();
    const Text = input.substring(2);
    if (mode != "E" && mode != "D") {
        await respond({ text: "you no pick mode?" });
        return;
    }

    if (mode == "E") {await respond({ text: `*Encoded:* \`${Buffer.from(Text).toString("base64")}\`` });}
    else             {await respond({ text: `*Decoded:* \`${Buffer.from(Text, "base64").toString("utf-8")}\`` });}
});

app.command("/u$", async ({ command, ack, respond }) => {
    await ack();
    const input = command.text;
    if (!input) {
        await respond({ text: "add input." });
        return;
    }
    const mode = input.charAt(0).toUpperCase();
    const Text = input.substring(2);
    if (mode != "E" && mode != "D") {
        await respond({ text: "make shure to pick a mode." });
        return;
    }

    const encoded = [...Text].map(char => char.codePointAt(0));
    const decoded = String.fromCodePoint(...Text.split(","))

    if (mode == "E") {await respond({ text: `*Encoded:* ${encoded}`});}
    else             {await respond({ text: `*Decoded:* ${decoded}`});};
});