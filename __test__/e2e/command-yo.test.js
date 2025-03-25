const { it, describe, before} = require("node:test");
const { execute } = require("../../src/commands/User/Me.js");
const { Op } = require("sequelize");
const {EmbedBuilder} = require("discord.js");
const Users = require("../../src/models/User/Users.js");

// Connect to the DB
const { sequelize } = require("../../src/config/database.js");

beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(async () => {
    await sequelize.close(); // Close BD connection
    console.error.mockRestore();
});

//Command /yo test:

describe("Comando /yo", () => {
  let interaction;

  //Test 1: Error Test
  test("Debe responder con un error si no se encuentra el usuario", async () => {

    interaction = {
      commandName: "yo",
      user: { id: "123", email: "123e@gmail.com"},
      deferReply: jest.fn(),
      editReply: jest.fn(),
      replied: false,
      deferred: false,
    };

    const user = await Users.findOne({
      where: {
          [Op.or]: [{ userId: interaction.user.id }, { email: interaction.user.email }],
        },
    });

    expect(user).toBeNull();

    await execute(interaction);

    expect(interaction.deferReply).toHaveBeenCalled();
  
    expect(interaction.editReply).toHaveBeenCalledWith(
      {
        embeds: expect.any(Array),
      }
    );    

  });

  //Test 2: Don't have a profile
  test("Debe responder con un error si no se encuentra el perfil", async () => {

    const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

    interaction = {
      commandName: "yo",
      user: { id: "1351356333471039630", email: "david.huette@utec.edu.pe"},
      deferReply: jest.fn(),
      editReply: jest.fn(),
      replied: false,
      deferred: false,
    };

    const user = await Users.findOne({
      where: {
          [Op.or]: [{ userId: interaction.user.id }, { email: interaction.user.email }],
        },
    });

    console.log(user);

    expect(user).not.toBeNull();

    await execute(interaction);

    expect(interaction.editReply).toHaveBeenCalledWith({
      embeds: expect.any(Array),
    });

    const embed = interaction.editReply.mock.calls[0][0].embeds[0];
    expect(embed).toBeInstanceOf(EmbedBuilder);
    expect(embed.data.title).toEqual("No se encontró tu perfil");
    expect(embed.data.fields).toEqual(
      [{"inline": true, "name": "🚨", "value": expect.stringMatching(/\*\*Por favor, contacta con un\s+administrador o repórtalo\s+para resolver este problema\s+lo antes posible\.\*\*/m)},
        {"inline": true, "name": "📅", "value": date}]
    );
  });

  //Test 3: Response with the user profile

});