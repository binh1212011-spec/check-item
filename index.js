const { Client, GatewayIntentBits, Partials } = require("discord.js");
const express = require("express");
const fs = require("fs");
require("dotenv").config();

// ==== LOAD ITEMS ====
const items = JSON.parse(fs.readFileSync("./items.json", "utf8"));

// ==== DISCORD BOT ====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel],
});

// ==== Khi bot online ====
client.on("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ==== Auto add role base khi member join ====
client.on("guildMemberAdd", async (member) => {
  const baseRoleId = process.env.BASE_ROLE_ID; // role level 0
  if (!baseRoleId) return;
  try {
    await member.roles.add(baseRoleId);
    console.log(`🎉 Added base role to ${member.user.tag}`);
  } catch (err) {
    console.error("❌ Error adding base role:", err);
  }
});

// ==== Khi member nhận role mới → remove base role nếu cần ====
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const baseRoleId = process.env.BASE_ROLE_ID;
  const level5RoleId = process.env.LEVEL5_ROLE_ID;

  if (!baseRoleId || !level5RoleId) return;

  if (!oldMember.roles.cache.has(level5RoleId) && newMember.roles.cache.has(level5RoleId)) {
    try {
      await newMember.roles.remove(baseRoleId);
      console.log(`⚡ Removed base role from ${newMember.user.tag}`);
    } catch (err) {
      console.error("❌ Error removing base role:", err);
    }
  }
});

// ==== Lệnh !equip <itemName> ====
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!equip") || message.author.bot) return;

  const args = message.content.split(" ").slice(1);
  const itemName = args.join(" ");
  if (!itemName) {
    return message.reply("❌ Bạn phải nhập tên item. Ví dụ: `!equip Magic Sword`");
  }

  const item = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
  if (!item) {
    return message.reply("❌ Item này không tồn tại trong danh sách.");
  }

  // Check role
  if (!message.member.roles.cache.has(item.requiredRole)) {
    return message.reply("🚫 Bạn chưa đủ role để equip item này.");
  }

  // Nếu đủ role → gửi command Tatsu
  try {
    await message.channel.send(`t!give <@${message.author.id}> "${item.name}"`);
    return message.reply(`✅ Đã equip item **${item.name}** cho bạn!`);
  } catch (err) {
    console.error("❌ Error equip item:", err);
    return message.reply("❌ Có lỗi xảy ra khi equip item.");
  }
});

// ==== EXPRESS SERVER KEEP-ALIVE ====
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

app.listen(PORT, () => {
  console.log(`🌍 Web server running on port ${PORT}`);
});

// ==== LOGIN DISCORD ====
client.login(process.env.TOKEN);
