require("dotenv").config();
const axios = require("axios");

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});
const range = (length) => Array.from({ length }, (_, i) => i);

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
    text:
`Available Commands:
/pug-help    - shows this menu
/pug-ping    - Check bot latency
/pug-catfact - Get a cat fact
/pug-dogfact - get a dog fact
/pug-joke    - tells a joke`
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
    const I = command.body.text;
    if (!I) {
        await respond({text:"type something!"});
        return;
    };
    await respond({text:I})
});

let key = [
  "a", "A", "b", "B", "c", "C", "d", "D", "e", "E", "f", "F", "g", "G", 
  "h", "H", "i", "I", "j", "J", "k", "K", "l", "L", "m", "M", "n", "N", 
  "o", "O", "p", "P", "q", "Q", "r", "R", "s", "S", "t", "T", "u", "U", 
  "v", "V", "w", "W", "x", "X", "y", "Y", "z", "Z"
];

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