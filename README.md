# First Slack Bot
a slack bot with cryptography and API based commands

how to use bot - it is installed on hackclub so just go to slack, perferably the #msg-pug-bot channel 
(https://hackclub.enterprise.slack.com/archives/C0B96QM14UR) (or msg yourself) so you don't bother anyone, 
and type / followed by one of the commands at the bottom.

how to set up bot (optional) - https://slack.com/oauth/v2/authorize?client_id=2210535565.11260056134019&scope=chat:write,commands,app_mentions:read,channels:history&user_scope=


note - almost all commands require an input after the command. Make sure the input is separated from the command with a space.


What i learned:
I learned a lot about javascript, and APIs.
Along with how to connect js and python, and create hosted code on nest through ssh.


Notable features - The most notable feature are is the custom encoder I made "/e$" and "/d$",
since not only is it my own cipher but it has a couple of other commands that interact with it,
Like "/sk$" which sets the key of the cipher, and it even resets the key every night automatically.


below are some img's showing how pug bot can be used
![shows hashing and ai usage](img1.png)
![shows the custom encoding tool](img2.png)
![shows weather command](img3.png)


Pug Bot - Cryptography & Utility Bot
Stuff you can do:
Core:
- /pug-help        - displays this.
- /pug-ping        - pings the bot.
- /pug-echo [text] - just says the textCryptography & Math:
- /e$ [text]           - Custom differential encoder.
- /d$ [text]           - Custom differential decoder.
- /sk$ [optional: ...] - shuffles, or sets the key used for /e$ and /d$.
- /rk                  - resets key.
- /hash$ [text]        - hashes the text.
- /calc$ [expression]  - evaluates a expression
- /vigenere$           - another cipher.
- /rail$               - oh,imo and guess what another one.
- /b64$                - wait, there's another ciphers.
- /u$                   - converts between string and unicode (use ',').API Stuff:
- /pug-catfact - gives you a fun cat fact.
- /pug-dogfact - gives you a fun dog fact.
- /pug-joke    - tells a joke.
- /translate$  - translates text
- /pug-weather - fetches weather for that reigon
- /pug-remind  - reminds you of a msg in x minutes
- /pug-rate    - get the rate of currency
- /ai$         - sends a prompt to gemini and gives response

