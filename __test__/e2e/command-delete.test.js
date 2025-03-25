// tests/eliminar.e2e.test.js
const { describe, test, beforeAll, afterAll, expect } = require("@jest/globals");
const { EmbedBuilder } = require("discord.js");

// Configurar variables de entorno
process.env.ADMIN_ROLE = "admin-role";
process.env.DEV_ROLE = "dev-role";

const { sequelize } = require("../src/config/database");
const Items = require("../src/models/Item/Items.js");
const Store = require("../src/models/Store/Store.js");

// Importa el comando real /eliminar (ajusta la ruta según tu estructura)
const eliminarCommand = require("../src/commands/store/eliminar");

let consoleErrorSpy;

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  // Asegúrate de que exista una tienda
  let store = await Store.findOne();
  if (!store) {
    await Store.create({ name: "Rocky Store" });
  }
});

afterAll(async () => {
  await sequelize.close();
  consoleErrorSpy.mockRestore();
});

describe("E2E - Comando /eliminar", () => {
  test("Debe eliminar un artículo existente en la tienda", async () => {
    // Prepara: crea un item de prueba en la categoría "testcategory"
    const store = await Store.findOne();
    let item = await Items.findOne({
      where: { name: "TestItemToDelete", category: "testcategory" },
    });
    if (!item) {
      item = await Items.create({
        name: "TestItemToDelete",
        description: "Descripción de prueba",
        price: 50,
        category: "testcategory",
        storeId: store.id,
        badge: "coin",
      });
    }

    // Simula la interacción
    const interaction = {
      user: { id: "testEliminarUser", username: "EliminarUser" },
      member: {
        roles: {
          // Se asigna el rol de administrador para que el comando permita la eliminación
          cache: new Map([[process.env.ADMIN_ROLE, true]]),
        },
      },
      deferred: false,
      replied: false,
      options: {
        getString: (optionName) => {
          if (optionName === "category") return "testcategory";
          if (optionName === "item") return "TestItemToDelete";
          return null;
        },
      },
      deferReply: jest.fn(async (opts) => {
        interaction.deferred = true;
      }),
      editReply: jest.fn(async (reply) => reply),
      reply: jest.fn(async (reply) => reply),
    };

    await eliminarCommand.execute(interaction);

    // Verifica que se haya diferido y editado la respuesta
    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalled();

    const replyData = interaction.editReply.mock.calls[0][0];
    expect(typeof replyData).toBe("string");
    expect(replyData).toMatch(/eliminado/);

    // Comprueba que el item ya no exista en la base de datos
    const itemDB = await Items.findOne({
      where: { name: "TestItemToDelete", category: "testcategory" },
    });
    expect(itemDB).toBeNull();
  });
});
