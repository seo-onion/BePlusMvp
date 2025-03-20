// tests/rockie.integration.test.js
const { describe, test, beforeAll, afterAll, expect } = require("@jest/globals");
const { Op } = require("sequelize");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

// Importa la conexión y los modelos reales
const { sequelize } = require("../src/config/database");
const Users = require("../src/models/User/Users");

// Importa la implementación real del comando /rockie
const { execute } = require("../src/commands/Rockie/rockie");
const { existsSync } = require("fs");

let consoleErrorSpy; // Variable para guardar el spy sobre console.error

// Antes de ejecutar cualquier test, conectamos a la BD y sincronizamos el modelo.
// Además, creamos (o verificamos) la existencia de un usuario de prueba.
beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  // Suprimir los console.error para evitar ruido en la salida
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// Al finalizar, cerramos la conexión a la base de datos y restauramos el
// comportamiento original de console.error.
afterAll(async () => {
  await sequelize.close();
});

describe("Integración - Comando /rockie", () => {
  test("Debe crear o mostrar el Rockie y enviar la respuesta correctamente", async () => {
    const existingUser = await Users.findOne({
      where: {
          [Op.or]: [{ userId: "1351356333471039630" }, { email: "david.huette@utec.edu.pe" }],
        },
    });

    console.log("existingUser", existingUser);

    // Simulamos el objeto interaction que se recibe en el comando.
    const interaction = {
      user: { id: existingUser.dataValues.userId , username: existingUser.dataValues.email },
      // Indicamos que la respuesta ya fue diferida (esto fuerza al comando a usar editReply)
      deferred: true,
      replied: false,
      // editReply simula el envío de la respuesta; aquí se guarda el argumento para su verificación.
      editReply: jest.fn(async (response) => response)
    };

    // Ejecutamos el comando, lo que debería:
    // 1. Buscar (o crear) el Rockie.
    // 2. Renderizar la imagen de Rockie (retornando un buffer).
    // 3. Buscar el usuario en la BD.
    // 4. Enviar un embed con la información y adjuntar el archivo "rockie.png".
    await execute(interaction);

    // Verificamos que se llamó a interaction.editReply.
    expect(interaction.editReply).toHaveBeenCalled();
    const replyData = interaction.editReply.mock.calls[0][0];

    // Se espera que se envíe un objeto con propiedades "embeds" y "files".
    expect(replyData).toHaveProperty("embeds");
    expect(Array.isArray(replyData.embeds)).toBe(true);
    expect(replyData.embeds.length).toBeGreaterThan(0);

    expect(replyData).toHaveProperty("files");
    expect(Array.isArray(replyData.files)).toBe(true);
    expect(replyData.files.length).toBeGreaterThan(0);

    // Validamos que el primer elemento del array de embeds es una instancia de EmbedBuilder.
    const embed = replyData.embeds[0];
    expect(embed).toBeInstanceOf(EmbedBuilder);

    // Validamos que el título incluya el nombre del Rockie
    expect(embed.data.title).toMatch(/🐻 Tu Rockie - /);

    // Verificamos la existencia de los campos "⭐ Nivel", "💰 RockieCoins" y "💎 RockieGems"
    const fields = embed.data.fields;
    expect(Array.isArray(fields)).toBe(true);
    const nivelField = fields.find((f) => f.name === "⭐ Nivel");
    const coinsField = fields.find((f) => f.name === "💰 RockieCoins");
    const gemsField = fields.find((f) => f.name === "💎 RockieGems");
    expect(nivelField).toBeDefined();
    expect(coinsField).toBeDefined();
    expect(gemsField).toBeDefined();

    // Verificamos que el attachment es una instancia de AttachmentBuilder y se llame "rockie.png"
    const attachment = replyData.files[0];
    expect(attachment).toBeInstanceOf(AttachmentBuilder);
    expect(attachment.name).toEqual("rockie.png");

    // Como comprobación adicional, buscamos el usuario empleado en la ejecución del comando
    const userFromDb = await Users.findOne({
      where: {
        [Op.or]: [
          { userId: interaction.user.id },
          { email: "test@example.com" }
        ]
      }
    });
    expect(userFromDb).not.toBeNull();
  });
});
