const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const ITEMS = require("./items"); // load danh sách item

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = process.env.PREFIX || "!";

// 🔹 ID roles base/level (thay bằng ID thật trong server)
const BASE_ROLE_ID = "1415319898468651008";      // Role Level 0
const LEVEL5_ROLE_ID = "1415350765291307028";  // Role Level 5

client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// 1️⃣ Auto add base role khi member mới join
client.on("guildMemberAdd", async (member) => {
  const baseRole = member.guild.roles.cache.get(BASE_ROLE_ID);
  if (baseRole) {
    await member.roles.add(baseRole).catch(console.error);
    console.log(`Added base role to ${member.user.tag}`);
  }
});

// 2️⃣ Auto remove base role khi member đạt Level 5
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const baseRole = newMember.guild.roles.cache.get(BASE_ROLE_ID);
  const level5Role = newMember.guild.roles.cache.get(LEVEL5_ROLE_ID);

  if (!baseRole || !level5Role) return;

  if (!oldMember.roles.cache.has(level5Role.id) && newMember.roles.cache.has(level5Role.id)) {
    await newMember.roles.remove(baseRole).catch(console.error);
    console.log(`Removed base role from ${newMember.user.tag}`);
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
    if (!itemName) return message.reply("⚠️ Bạn cần nhập tên item muốn equip.");

    const item = ITEMS[itemName];
    if (!item) {
      return message.reply("❌ Item này chưa được cấu hình trong bot.");
    }

    const member = message.member;

    if (!member.roles.cache.has(item.roleId)) {
      return message.reply("🚫 Bạn chưa sở hữu role cần thiết để equip item này.");
    }

    // ✅ Gửi lệnh Tatsu để equip item
    message.channel.send(`t!give ${member} "${itemName}"`);
    message.reply(`🎉 Đã equip item **${itemName}** thành công!\n✨ Effect: ${item.effect}`);
  }
});

client.login(process.env.TOKEN);
