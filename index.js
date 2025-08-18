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

client.on("messageCreate", async (msg) => {
  const tasks = config.reactions
    .filter(r => shouldReact(msg.content, r.regex))
    .map(r => tryReact(msg, r).catch(console.error));

  if (tasks.length > 0) {
    await Promise.all(tasks);
  }
});

/**
 * Build regex and test against message content
 */
function shouldReact(content, regexDef) {
  const flags =
    (regexDef.global ? "g" : "") +
    (regexDef.multiline ? "m" : "") +
    (regexDef.caseInsensitive ? "i" : "");
  const regex = new RegExp(regexDef.content, flags);
  return regex.test(content);
}

/**
 * Attempt to react with either a server or unicode emoji
 */
async function tryReact(msg, reaction) {
  if (reaction.serverEmoji) {
    const emoji = await resolveServerEmoji(msg, reaction.serverEmoji);
    if (emoji) {
      return msg.react(emoji);
    }
    console.warn(`⚠️  Emoji "${reaction.serverEmoji}" not found in cache or guild`);
  }

  if (reaction.unicodeEmoji) {
    return msg.react(reaction.unicodeEmoji);
  }
}

/**
 * Resolve a guild emoji by name, checking cache first then fetching
 */
async function resolveServerEmoji(msg, emojiName) {
  let emoji = client.emojis.cache.find(e => e.name === emojiName);
  if (!emoji && msg.guild) {
    const fetched = await msg.guild.emojis.fetch();
    emoji = fetched.find(e => e.name === emojiName);
  }
  return emoji;
}

if (!process.env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN is missing in .env");
  process.exit(1);
} else {
  console.log("✅ Logging in with Discord token, length:", process.env.DISCORD_TOKEN.length + "\nReactBot is ready.");
}

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error("Client login failed, check your token:", err);
});
