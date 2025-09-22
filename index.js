const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
require("dotenv").config();

const items = require("./items");

// Bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Keep-alive cho Render
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(3000, () => console.log("🌐 Keep-alive server running"));

// Dữ liệu user trang bị
const equippedItems = new Map();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Auto add role base khi member join
client.on("guildMemberAdd", async (member) => {
  const baseRole = process.env.BASE_ROLE;
  if (baseRole) {
    await member.roles.add(baseRole).catch(console.error);
    console.log(`Added base role to ${member.user.tag}`);
  }
});

// Khi user nhận role level 5 thì xóa role base
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const level5Role = process.env.LEVEL5_ROLE;
  const baseRole = process.env.BASE_ROLE;

  if (!oldMember.roles.cache.has(level5Role) && newMember.roles.cache.has(level5Role)) {
    if (newMember.roles.cache.has(baseRole)) {
      await newMember.roles.remove(baseRole).catch(console.error);
      console.log(`Removed base role from ${newMember.user.tag}`);
    }
  }
});

// Xử lý command prefix "!"
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);

  // !item → liệt kê item
  if (cmd === "item") {
    const list = Object.keys(items).map((name) => `• ${name}`).join("\n");
    return message.reply(`📦 Danh sách item:\n${list}`);
  }

  // !equip <tên item>
  if (cmd === "equip") {
    const itemName = args.join(" ");
    if (!items[itemName]) {
      return message.reply("❌ Item không tồn tại.");
    }

    const requiredRole = items[itemName].roleId;
    if (!message.member.roles.cache.has(requiredRole)) {
      return message.reply("🚫 Bạn không có role cần thiết để dùng item này.");
    }

    // Trang bị
    equippedItems.set(message.author.id, itemName);
    return message.reply(`✅ Bạn đã trang bị **${itemName}** thành công!`);
  }

  // !myequip → xem item đã trang bị
  if (cmd === "myequip") {
    const current = equippedItems.get(message.author.id);
    if (!current) return message.reply("ℹ️ Bạn chưa trang bị item nào.");
    return message.reply(`🎖️ Bạn đang trang bị: **${current}**`);
  }
});

client.login(process.env.DISCORD_TOKEN);
