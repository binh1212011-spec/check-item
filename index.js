const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = "!";

// 🔹 Thay bằng ID roles thực tế của server
const BASE_ROLE_ID = "BASE_ROLE_ID_HERE";       // Level 0
const LEVEL5_ROLE_ID = "LEVEL5_ROLE_ID_HERE";   // Level 5
// Ví dụ: item role: "Magic Sword Owner" -> ID tương ứng
const ITEM_ROLES = {
  "Magic Sword": "MAGIC_SWORD_ROLE_ID",
  "Epic Shield": "EPIC_SHIELD_ROLE_ID"
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// 1️⃣ Auto add base role khi member mới vào server
client.on("guildMemberAdd", async (member) => {
  const baseRole = member.guild.roles.cache.get(BASE_ROLE_ID);
  if (baseRole) await member.roles.add(baseRole).catch(console.error);
});

// 2️⃣ Auto remove base role khi member đạt level 5
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const baseRole = newMember.guild.roles.cache.get(BASE_ROLE_ID);
  const level5Role = newMember.guild.roles.cache.get(LEVEL5_ROLE_ID);

  if (!baseRole || !level5Role) return;

  if (!oldMember.roles.cache.has(level5Role.id) && newMember.roles.cache.has(level5Role.id)) {
    await newMember.roles.remove(baseRole).catch(console.error);
    console.log(`Removed base role from ${newMember.user.tag} because they got Level 5`);
  }
});

// 3️⃣ Command !equip để equip item Tatsu dựa trên role
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "equip") {
    const itemName = args.join(" ");
    if (!itemName) return message.reply("Bạn cần nhập tên item muốn equip.");

    const member = message.member;
    const roleIdRequired = ITEM_ROLES[itemName];

    if (!roleIdRequired) {
      return message.reply(`Item "${itemName}" chưa được cấu hình role ID.`);
    }

    if (!member.roles.cache.has(roleIdRequired)) {
      return message.reply("Bạn chưa sở hữu role cần thiết để equip item này.");
    }

    // Gửi lệnh Tatsu để gán item
    message.channel.send(`t!give ${member} "${itemName}"`);
    message.reply(`Đã equip item "${itemName}" thành công!`);
  }
});

client.login(process.env.TOKEN);
