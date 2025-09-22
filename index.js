const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  Events, 
  REST, 
  Routes, 
  SlashCommandBuilder 
} = require("discord.js");
const dotenv = require("dotenv");
const items = require("./items.js");

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.GuildMember]
});

// ======= Đăng ký slash command =======
const commands = [
  new SlashCommandBuilder()
    .setName("equip")
    .setDescription("Equip một item nếu bạn có role yêu cầu")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("Tên item muốn equip")
        .setRequired(true)
        .setAutocomplete(true)
    )
].map(command => command.toJSON());

client.once(Events.ClientReady, async c => {
  console.log(`✅ Logged in as ${c.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(c.user.id),
      { body: commands }
    );
    console.log("✅ Slash commands loaded.");
  } catch (error) {
    console.error("❌ Error loading commands:", error);
  }

  console.log("Loaded items:", Object.keys(items));
});

// ======= Autocomplete cho /equip =======
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused();
    const choices = Object.keys(items);
    const filtered = choices.filter(choice => choice.toLowerCase().includes(focused.toLowerCase()));
    await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
  }
});

// ======= Xử lý /equip =======
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "equip") {
    const itemName = interaction.options.getString("item");
    const item = items[itemName];

    if (!item) {
      return interaction.reply({ content: `❌ Không tìm thấy item **${itemName}**.`, ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);

    if (!member.roles.cache.has(item.roleId)) {
      return interaction.reply({ content: `❌ Bạn không có role yêu cầu để equip **${itemName}**.`, ephemeral: true });
    }

    return interaction.reply({ content: `✅ Bạn đã equip thành công item **${itemName}** (role hợp lệ).` });
  }
});

// ======= Auto add role base khi join =======
client.on(Events.GuildMemberAdd, async member => {
  try {
    await member.roles.add(process.env.BASE_ROLE_ID);
    console.log(`Đã thêm role base cho ${member.user.tag}`);
  } catch (err) {
    console.error("Lỗi khi thêm role base:", err);
  }
});

// ======= Auto chuyển role base -> level5 =======
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    if (!oldMember.roles.cache.has(process.env.LEVEL5_ROLE_ID) && newMember.roles.cache.has(process.env.LEVEL5_ROLE_ID)) {
      await newMember.roles.remove(process.env.BASE_ROLE_ID);
      console.log(`Đã xoá role base cho ${newMember.user.tag} vì đạt level 5`);
    }
  } catch (err) {
    console.error("Lỗi khi chuyển role:", err);
  }
});

client.login(process.env.TOKEN);
