const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Items = require("../../src/models/Item/Items.js");
const createErrorEmbed = require("../../src/utils/embed/errorEmbed.js");
const { describe } = require("node:test");
const { execute } = require("../../src/commands/Store/ShowItems.js");

//Mocks
jest.mock("../src/models/Item/Items.js", () => ({
  findAll: jest.fn(),
}));
jest.mock("../src/utils/embed/errorEmbed.js",()=> jest.fn());

//Command /tienda test:
describe("Comando /tienda", () => {
    let interaction;
    let store_items;

    beforeEach(() => {
        jest.clearAllMocks();
      });

    //Test 1: Store is Empty
    test("Debería responder con un mensaje si no hay artículos en la tienda", async () => {

        interaction = {
        commandName: "tienda",
        editReply: jest.fn(),
        };

        store_items = [];
    
        Items.findAll.mockResolvedValue(store_items);
    
        await execute(interaction);
    
        expect(Items.findAll).toHaveBeenCalled();
        expect(interaction.editReply).toHaveBeenCalledWith("❌ No hay artículos en la tienda en este momento.");
    });


});
