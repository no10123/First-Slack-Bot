require("dotenv").config();
const axios = require("axios");

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
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
