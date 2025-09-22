const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const items = require("./items");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

const PREFIX = "!";

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log("Loaded items:", Object.keys(items));
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Lệnh xem danh sách item
  if (command === "item") {
    const list = Object.keys(items).map(i => `- ${i}`).join("\n");
    return message.channel.send(`📜 Danh sách item khả dụng:\n${list}`);
  }

  // Lệnh equip item
  if (command === "equip") {
    const itemName = args.join(" ");
    if (!itemName) return message.reply("❌ Bạn cần nhập tên item để equip!");

    const item = items[itemName];
    if (!item) return message.reply("❌ Item không tồn tại!");

    const member = await message.guild.members.fetch(message.author.id);

    if (!member.roles.cache.has(item.roleId)) {
      return message.reply("🚫 Bạn không có role yêu cầu để equip item này!");
    }

    return message.reply(`✅ Bạn đã equip **${itemName}** thành công! (flex trên card)`);
  }
});

client.login(process.env.TOKEN);
