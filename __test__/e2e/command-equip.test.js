// tests/equipar.e2e.test.js
const { describe, test, beforeAll, afterAll, expect } = require("@jest/globals");
const equiparCommand = require("../src/commands/rockie/equipar");
const { sequelize } = require("../src/config/database");
const Users = require("../src/models/User/Users");

let consoleErrorSpy;

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  // Suprime los mensajes de error en consola
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  // Crea el usuario de prueba para equipar, si no existe.
  const existingUser = await Users.findByPk("testEquipar");
  if (!existingUser) {
    await Users.create({
      userId: "testEquipar",
      username: "EquiparUser",
      email: "equipar@example.com",
      rockyCoins: 150,
      rockyGems: 60
    });
  }
});

afterAll(async () => {
  await sequelize.close();
  consoleErrorSpy.mockRestore();
});

describe("E2E - Comando /equipar", () => {
  test("Debe equipar el accesorio y devolver un mensaje de éxito", async () => {
    // Simula la interacción de Discord.
    const interaction = {
      user: { id: "testEquipar", username: "EquiparUser" },
      deferred: false,
      replied: false,
      options: {
        getString: (optionName) => {
          if (optionName === "nombre") return "TestAccessory";
          return null;
        }
      },
      deferReply: jest.fn(async (opts) => {
        interaction.deferred = true;
      }),
      editReply: jest.fn(async (reply) => reply),
      reply: jest.fn(async (reply) => reply)
    };

    await equiparCommand.execute(interaction);

    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalled();

    const replyResult = interaction.editReply.mock.calls[0][0];
    // Se espera que el comando retorne un string con el mensaje de éxito.
    expect(typeof replyResult).toBe("string");
    // Se asume que en el resultado exitoso no aparece un mensaje de error.
    expect(replyResult).not.toContain("❌");
  });
});
