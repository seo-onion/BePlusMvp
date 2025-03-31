// tests/rockie.integration.test.js
const { describe, test, beforeAll, afterAll, expect } = require("@jest/globals");
const { Op } = require("sequelize");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

// Import the database connection and models.
const { sequelize } = require("../../src/config/database");
const Users = require("../../src/models/User/Users");

//Import the command to test.
const { execute } = require("../../src/commands/Rockie/rockie");
const { existsSync } = require("fs");

let consoleErrorSpy; // Variable para guardar el spy sobre console.error

//Connect to the db and sync the models before all tests.s
beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  // Suprimir los console.error para evitar ruido en la salida
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// At the end close the connection to the db.
afterAll(async () => {
  await sequelize.close();
});

describe("Integración - Comando /rockie", () => {
  test("Debe crear o mostrar el Rockie y enviar la respuesta correctamente", async () => {

    // Search for the user in the database.
    const existingUser = await Users.findOne({
      where: {
          [Op.or]: [{ userId: "1351356333471039630" }, { email: "david.huette@utec.edu.pe" }],
        },
    });

    // Simulamos el objeto interaction que se recibe en el comando.
    const interaction = {
      user: { id: existingUser.dataValues.userId , username: existingUser.dataValues.email },
      // Indicamos que la respuesta ya fue diferida (esto fuerza al comando a usar editReply)
      deferred: true,
      replied: false,
      // editReply simula el envío de la respuesta; aquí se guarda el argumento para su verificación.
      editReply: jest.fn(async (response) => response)
    };

    //Execute the command and wait for the response
    await execute(interaction);

    // Verify we called interaction.editReply.
    expect(interaction.editReply).toHaveBeenCalled();
    const replyData = interaction.editReply.mock.calls[0][0];

    // Expect an object with properties "embeds" and "files".
    expect(replyData).toHaveProperty("embeds");
    expect(Array.isArray(replyData.embeds)).toBe(true);
    expect(replyData.embeds.length).toBeGreaterThan(0);

    expect(replyData).toHaveProperty("files");
    expect(Array.isArray(replyData.files)).toBe(true);
    expect(replyData.files.length).toBeGreaterThan(0);

    // Check the first element is array of embeds.
    const embed = replyData.embeds[0];
    expect(embed).toBeInstanceOf(EmbedBuilder);

    // Check the title is correct.
    expect(embed.data.title).toMatch(/🐻 Tu Rockie - /);

    // Check the other fields are correct.
    const fields = embed.data.fields;
    expect(Array.isArray(fields)).toBe(true);
    const nivelField = fields.find((f) => f.name === "⭐ Nivel");
    const coinsField = fields.find((f) => f.name === "💰 RockieCoins");
    const gemsField = fields.find((f) => f.name === "💎 RockieGems");
    expect(nivelField).toBeDefined();
    expect(coinsField).toBeDefined();
    expect(gemsField).toBeDefined();

    // Check the attachment is an instance of AttachmentBuilder and is called "rockie.png"
    const attachment = replyData.files[0];
    expect(attachment).toBeInstanceOf(AttachmentBuilder);
    expect(attachment.name).toEqual("rockie.png");

  });
});
