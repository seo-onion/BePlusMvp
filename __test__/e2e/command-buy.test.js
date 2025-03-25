// tests/comprar.e2e.test.js
const { describe, test, beforeAll, afterAll, expect } = require("@jest/globals");
const { EmbedBuilder } = require("discord.js");
const comprarCommand = require("../src/commands/store/comprar");
const { sequelize } = require("../src/config/database");
const Users = require("../src/models/User/Users");

let consoleErrorSpy;

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  // Suprime los mensajes de error en consola
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  // Crea el usuario de prueba para comprar, si no existe.
  const existingUser = await Users.findByPk("testComprar");
  if (!existingUser) {
    await Users.create({
      userId: "testComprar",
      username: "ComprarUser",
      email: "comprar@example.com",
      rockyCoins: 200,
      rockyGems: 80
    });
  }
});

afterAll(async () => {
  await sequelize.close();
  consoleErrorSpy.mockRestore();
});

describe("E2E - Comando /comprar", () => {
  test("Debe procesar una compra exitosa y devolver un embed de resultado", async () => {
    // Simula la interacción de Discord.
    const interaction = {
      user: { id: "testComprar", username: "ComprarUser" },
      deferred: false,
      replied: false,
      options: {
        // Simula la obtención de opciones de la interacción.
        getString: (optionName) => {
          if (optionName === "category") return "TestCategory";
          if (optionName === "item") return "TestItem";
          return null;
        }
      },
      deferReply: jest.fn(async (opts) => {
        interaction.deferred = true;
      }),
      editReply: jest.fn(async (reply) => reply),
      reply: jest.fn(async (reply) => reply)
    };

    await comprarCommand.execute(interaction);

    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalled();

    const replyData = interaction.editReply.mock.calls[0][0];
    expect(replyData).toHaveProperty("embeds");
    expect(Array.isArray(replyData.embeds)).toBe(true);
    expect(replyData.embeds.length).toBeGreaterThan(0);

    const embed = replyData.embeds[0];
    expect(embed).toBeInstanceOf(EmbedBuilder);
    // Puedes agregar validaciones adicionales según el contenido del embed.
  });
});
