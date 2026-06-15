#First Slack Bot
a slack bot with cryptography and api based commands

what this project is: 
A slack bot built for the hack club slack workspace that lets you run cryptography tools, api utilities, and simple automation commands directly inside slack. It started as a small experiment for stardance but grew into a larger system for exploring backend development, apis, and basic cryptography design.

the bot is designed around a command system where everything is triggered through / commands. each command either performs a transformation (like encoding or decoding text), fetches external data through API's, or runs a utility function (like hashing).

the main goal of this project was to understand how irl bots connect multiple systems together: apis, persistent storage, and background processes.

how to use the bot: <br>
the bot is already installed in the hack club slack workspace.<br>
to use it:<br>
go to slack and run commands starting with /<br>
it is recommended to use the bot in the #msg-pug-bot channel or message it directly.<br>
example usage:<br>
/pug-help<br>
/pug-ping<br>
/e$ hello<br>

Note: almost all commands require an input after the command, separated by a space.<br>
setup (optional):<br>
if you want to run your own version:

https://slack.com/oauth/v2/authorize?client_id=2210535565.11260056134019&scope=chat:write,commands,app_mentions:read,channels:history&user_scope=

clone the repository:<br>
git clone https://github.com/no10123/First-Slack-Bot/<br>
cd https://github.com/no10123/First-Slack-Bot/<br>
npm install


set environment variables (create a .env file):<br>
SLACK_BOT_TOKEN=your_token<br>
SLACK_APP_TOKEN=your_token<br>
run the bot:<br>
node index.js


I learned a lot about what API's are and how they work, ssh servers, 
and hosting code, cryptography, and backend systems.

this project taught me how to:

build a slack bot using node.js and slack bolt<br>
work with external apis and async request handling<br>
connect multiple services together (slack, python services, external apis)<br>
store persistent data using local json files<br>
design command based systems that stay scalable as features grow<br>
deploy and host backend code on remote servers using ssh<br>
notable features<br>

the coolest part of this project is the custom encoding system built around /e$ and /d$.<br>
this system works like a stateful cipher where text is encoded based on a mutable key that can be changed or shuffled using /sk$ and reset with /rk. the key is stored persistently and can also be automatically rotated on a schedule.

this makes the system more than just a static cipher, since the output depends on runtime state rather than a fixed algorithm.

key commands:

/e$ encodes text using the custom cipher<br>
/d$ decodes encoded text<br>
/sk$ changes or shuffles the cipher key<br>
/rk resets the cipher key<br>

this system demonstrates:<br>
cryptographic design, custom algorithm design, and basic key management.

features

cryptography and utilities:

/e$ custom encoder
/d$ custom decoder
/sk$ key shuffle or set
/rk reset key
/hash$ hashing
/calc$ expression evaluation
/vigenere$ cipher
/rail$ rail fence cipher
/b64$ base64 encode/decode
/u$ unicode conversion

api and external tools:

/pug-catfact random cat fact
/pug-dogfact random dog fact
/pug-joke random joke
/translate$ text translation
/pug-weather weather lookup
/pug-remind scheduled reminders
/pug-rate currency conversion
/ai$ ai response via backend api

core:

/pug-help command list
/pug-ping latency test
/pug-echo text output


below are some img's showing how pug bot can be used
![shows hashing and ai usage](img1.png)
![shows the custom encoding tool](img2.png)
![shows weather command](img3.png)


credits:
Built by me
Built for stardance

built by me
built for hack club stardance
