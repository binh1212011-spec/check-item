const { Client, GatewayIntentBits, Partials } = require("discord.js");
const express = require("express");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// ===== KEEP-ALIVE SERVER =====
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(PORT, () => console.log(`Keep-alive running on port ${PORT}`));

const guildId = process.env.GUILD_ID;
const roleBase = process.env.ROLE_BASE;
const roleLevel5 = process.env.ROLE_LEVEL5;

// ===== Khi user join server =====
client.on("guildMemberAdd", async (member) => {
  try {
    await member.roles.add(roleBase);
    console.log(`Đã gán role base cho ${member.user.tag}`);
  } catch (err) {
    console.error("Lỗi khi add role base:", err);
  }
});

// ===== Giả lập lên level 5 bằng command "!level5" =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!level5") {
    const member = message.member;
    try {
      await member.roles.remove(roleBase);
      await member.roles.add(roleLevel5);
      console.log(`Đã chuyển ${member.user.tag} sang role level 5`);
    } catch (err) {
      console.error("Lỗi khi đổi role:", err);
    }
  }
});

client.once("ready", () => {
  console.log(`✅ Bot đã online với tên ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
