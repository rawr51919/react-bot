const fs = require("fs");
require("dotenv").config();
const path = require("path");
const Discord = require("discord.js");

const config = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "config.json")
).toString());
const client = new Discord.Client();

client.on("message", msg => {
  for (let i of config.reactions) {
    let regex = new RegExp(
      i.regex.content,
      (i.regex.global ? "g" : "") +
      (i.regex.multiline ? "m" : "") +
      (i.regex.caseInsensitive ? "i" : "")
    );
    if (regex.test(msg.content)) {
      msg.react(
        i.serverEmoji ?
          client.emojis.find("name", i.serverEmoji) :
          i.unicodeEmoji
      );
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
