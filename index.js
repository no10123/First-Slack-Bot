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

const iMorseMap = Object.fromEntries(
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
          text: "*Pug Bot - Cryptography & Utility Bot*\nStuff you can do:"
        }
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Core: " +
                "- `/pug-help`        - displays this.\n" +
                "- `/pug-ping`        - pings the bot.\n" +
                "- `/pug-echo [text]` - just says the text"
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
                "- `/calc$ [expression]`  - evaluates a expression"
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
                "- `/translate$`  - translates text"
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
    const input = command.text;
    if (!input) {
        await respond({ text: "oh no your empty msg is like a stab..." });
        return;
    }
    // get num and msg seperated
    const [num, ...messageP] = input.split(" "); ;
    const shift = parseInt(num, 10);
    const message = messageP.join(" ");
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
    const message = messageP.join(" ");
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
        const [Type, ...input] = input.split(" ")
    };
    const chars = input.toLowerCase().split("");
    let R = [];

    for (let char of chars) {
        if (morseCodeMap[char]) {
            if (Type == "D") {
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