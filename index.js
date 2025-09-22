const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ==== Keep-alive server ====
const app = express();
app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(3000, () => console.log("🌍 Keep-alive server running on port 3000"));

// ==== Items ====
const items = require("./items.js");

// ==== Khi bot online ====
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ==== Khi có member mới join ====
client.on("guildMemberAdd", async (member) => {
  const baseRole = member.guild.roles.cache.get(process.env.ROLE_BASE);
  if (baseRole) {
    await member.roles.add(baseRole);
    console.log(`➕ Gán role base cho ${member.user.tag}`);
  }
});

// ==== Khi member được update role (ví dụ lên level 5) ====
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const baseRole = newMember.guild.roles.cache.get(process.env.ROLE_BASE);
  const level5Role = newMember.guild.roles.cache.get(process.env.ROLE_LEVEL5);

  if (!baseRole || !level5Role) return;

  // Nếu user có role level 5 thì xóa role base
  if (!oldMember.roles.cache.has(level5Role.id) && newMember.roles.cache.has(level5Role.id)) {
    if (newMember.roles.cache.has(baseRole.id)) {
      await newMember.roles.remove(baseRole);
      console.log(`🔄 Removed base role from ${newMember.user.tag}`);
    }
  }
});

// ==== Command xử lý tin nhắn ====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // !item
  if (message.content === "!item") {
    const itemList = Object.keys(items)
      .map((name) => `🎁 ${name}`)
      .join("\n");
    message.reply(itemList || "❌ Không có item nào!");
  }

  // !equip <item name>
  if (message.content.startsWith("!equip")) {
    const args = message.content.split(" ").slice(1);
    const itemName = args.join(" ");
    const item = items[itemName];

    if (!item) {
      return message.reply("❌ Item không tồn tại.");
    }

    const role = message.guild.roles.cache.get(item.roleId);
    if (!role) {
      return message.reply("❌ Role không tồn tại trong server.");
    }

    await message.member.roles.add(role);
    message.reply(`✅ Bạn đã trang bị **${itemName}**`);
  }
});

client.login(process.env.TOKEN);
