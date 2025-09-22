// ==== IMPORT MODULES ====
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
require("dotenv").config();

// ==== DISCORD CLIENT ====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ==== KEEP-ALIVE SERVER ====
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is alive! ✅"));
app.listen(PORT, () => console.log(`🌐 Keep-alive server running on ${PORT}`));

// ==== LOAD ITEMS ====
let items = [];
try {
  const itemsPath = path.join(__dirname, "items.json");
  items = JSON.parse(fs.readFileSync(itemsPath, "utf8"));
  console.log(`📦 Loaded ${items.length} items.`);
} catch (err) {
  console.error("❌ Không load được items.json:", err);
  items = [];
}

// ==== READY EVENT ====
client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ==== COMMAND HANDLER ====
client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;

  if (msg.content.startsWith("!item")) {
    if (items.length === 0) {
      return msg.reply("❌ Không có item nào trong file.");
    }

    const randomItem = items[Math.floor(Math.random() * items.length)];

    const embed = new EmbedBuilder()
      .setTitle(`🎁 Bạn nhận được: ${randomItem.name}`)
      .setDescription(randomItem.description || "Không có mô tả")
      .setColor("#FFD700");

    msg.reply({ embeds: [embed] });
  }
});

// ==== LOGIN ====
client.login(process.env.TOKEN);
