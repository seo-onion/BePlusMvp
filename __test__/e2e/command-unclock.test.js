// tests/desbloquear.e2e.test.js
const { describe, test, beforeAll, afterAll, expect } = require("@jest/globals");
const { EmbedBuilder } = require("discord.js");
const desbloquearCommand = require("../src/commands/achievement/desbloquear");
const { sequelize } = require("../src/config/database");
const Users = require("../src/models/User/Users");

let consoleErrorSpy;

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  // Suprime los mensajes de error en consola
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  // Crea el usuario de prueba para desbloquear, si no existe.
  const existingUser = await Users.findByPk("testDesbloquear");
  if (!existingUser) {
    await Users.create({
      userId: "testDesbloquear",
      username: "DesbloquearUser",
      email: "desbloquear@example.com",
      rockyCoins: 100,
      rockyGems: 50
    });
  }
});

afterAll(async () => {
  await sequelize.close();
  consoleErrorSpy.mockRestore();
});

describe("E2E - Comando /desbloquear", () => {
  test("Debe devolver un embed de alerta si no se desbloquea ningún logro nuevo", async () => {
    // Simula la interacción de Discord.
    const interaction = {
      user: { id: "testDesbloquear", username: "DesbloquearUser" },
      deferred: false,
      replied: false,
      deferReply: jest.fn(async (opts) => {
        interaction.deferred = true;
      }),
      editReply: jest.fn(async (reply) => reply),
      reply: jest.fn(async (reply) => reply)
    };

    await desbloquearCommand.execute(interaction);

    // Se debe haber diferido y luego editado la respuesta.
    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalled();

    const replyData = interaction.editReply.mock.calls[0][0];
    expect(replyData).toHaveProperty("embeds");
    expect(Array.isArray(replyData.embeds)).toBe(true);
    expect(replyData.embeds.length).toBeGreaterThan(0);

    const embed = replyData.embeds[0];
    expect(embed).toBeInstanceOf(EmbedBuilder);

    // Verifica que se muestre el mensaje de alerta.
    const description = embed.data.description || "";
    expect(description).toContain("No has desbloqueado ningún logro nuevo");
  });
});
