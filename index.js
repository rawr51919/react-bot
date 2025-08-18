const fs = require("fs");
require("dotenv").config();
const path = require("path");
const { Client, GatewayIntentBits } = require("discord.js");

// Read your config.json
const config = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "config.json")).toString()
);

// Instantiate the client with the correct intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Required to read message content
    GatewayIntentBits.GuildMessageReactions
  ],
});

client.on("messageCreate", (msg) => { // note: 'messageCreate' in v14
  for (let i of config.reactions) {
    let regex = new RegExp(
      i.regex.content,
      (i.regex.global ? "g" : "") +
      (i.regex.multiline ? "m" : "") +
      (i.regex.caseInsensitive ? "i" : "")
    );
    if (regex.test(msg.content)) {
      msg.react(
        i.serverEmoji
          ? client.emojis.cache.find(e => e.name === i.serverEmoji)?.id
          : i.unicodeEmoji
      ).catch(console.error);
    }
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN is missing in .env");
  process.exit(1);
} else {
  console.log("✅ Logging in with Discord token, length:", process.env.DISCORD_TOKEN.length);
  console.log("ReactBot is ready.");
}

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error("Client login failed, check your token:", err);
});
