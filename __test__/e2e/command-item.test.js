// tests/item.e2e.test.js
const { describe, test, beforeAll, afterAll, beforeEach, expect } = require("@jest/globals");
const { EmbedBuilder } = require("discord.js");

// Configurar las variables de entorno necesarias
process.env.ADMIN_ROLE = "admin-role";
process.env.DEV_ROLE = "dev-role";

const { sequelize } = require("../src/config/database");
const Items = require("../src/models/Item/Items.js");
const Store = require("../src/models/Store/Store.js");

// Importa el comando real /item (ajusta la ruta según tu estructura)
const itemCommand = require("../src/commands/store/item");

let consoleErrorSpy;

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  // Opcional: puedes crear un Store de prueba si aún no existe.
  const store = await Store.findOne();
  if (!store) {
    await Store.create({ name: "Rocky Store" });
  }
});

beforeEach(async () => {
  // Limpia (o elimina) el item de prueba para que cada test inicie sin datos previos
  await Items.destroy({
    where: { name: "TestItem", category: "testcategory" },
  });
});

afterAll(async () => {
  await sequelize.close();
  consoleErrorSpy.mockRestore();
});

describe("E2E - Comando /item", () => {
  test("Debe añadir (o actualizar) un artículo exitosamente", async () => {
    // Simula el objeto interaction de Discord
    const interaction = {
      user: { id: "testItemUser", username: "ItemUser" },
      member: {
        roles: {
          // Se asigna el rol de administrador para pasar la validación
          cache: new Map([[process.env.ADMIN_ROLE, true]]),
        },
      },
      deferred: false,
      replied: false,
      options: {
        getString: (optionName) => {
          if (optionName === "category") return "testcategory";
          if (optionName === "item") return "TestItem";
          return null;
        },
        getInteger: (optionName) => {
          if (optionName === "price") return 100;
          return null;
        },
      },
      deferReply: jest.fn(async (opts) => {
        interaction.deferred = true;
      }),
      editReply: jest.fn(async (reply) => reply),
      reply: jest.fn(async (reply) => reply),
    };

    // Ejecuta el comando
    await itemCommand.execute(interaction);

    // Verifica que se haya diferido y luego editado la respuesta
    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalled();

    // Obtén el mensaje (respuesta) enviado mediante editReply
    const replyData = interaction.editReply.mock.calls[0][0];
    expect(typeof replyData).toBe("string");
    expect(replyData).toMatch(/TestItem/);
    expect(replyData).toMatch(/testcategory/);

    // Comprueba en la base de datos que el item fue insertado con el precio correcto
    const itemInDB = await Items.findOne({
      where: { name: "TestItem", category: "testcategory" },
    });
    expect(itemInDB).not.toBeNull();
    expect(itemInDB.price).toBe(100);
  });
});
