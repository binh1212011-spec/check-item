const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

client.commands = new Collection();

// Load slash commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log("✅ Slash commands loaded.");
});

// Slash command handler
client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "❌ Lỗi khi chạy lệnh này.", ephemeral: true });
    }
  } else if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (command && command.autocomplete) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  }
});

// Prefix command !item
const items = require("./items");
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  if (message.content.startsWith("!item")) {
    const args = message.content.split(" ").slice(1);
    const itemName = args.join(" ");
    if (!itemName) return message.reply("❌ Hãy nhập tên item sau `!item`.");

    const item = items[itemName];
    if (!item) return message.reply(`❌ Item **${itemName}** không tồn tại.`);

    const roleId = item.roleId;
    if (!message.member.roles.cache.has(roleId)) {
      return message.reply(`❌ Bạn không có role để dùng item **${itemName}**.`);
    }

    return message.reply(`✅ Bạn đã dùng item **${itemName}**!`);
  }
});

client.login(process.env.TOKEN);
