const { SlashCommandBuilder } = require("discord.js");
const items = require("../items");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("equip")
    .setDescription("Equip an item")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("Chọn item bạn muốn equip")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const choices = Object.keys(items);
    const filtered = choices.filter(choice =>
      choice.toLowerCase().includes(focused.toLowerCase())
    );
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice }))
    );
  },

  async execute(interaction) {
    const itemName = interaction.options.getString("item");
    const item = items[itemName];

    if (!item) {
      return interaction.reply({ content: `❌ Item **${itemName}** không tồn tại.`, ephemeral: true });
    }

    const roleId = item.roleId;
    const member = interaction.member;

    if (!member.roles.cache.has(roleId)) {
      return interaction.reply({ content: `❌ Bạn không có role cần thiết để equip **${itemName}**.`, ephemeral: true });
    }

    return interaction.reply({ content: `✅ Bạn đã equip thành công **${itemName}**!`, ephemeral: true });
  },
};
