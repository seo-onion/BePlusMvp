// tests/empezar.integration.test.js
const { describe, test, expect } = require("@jest/globals");
const { EmbedBuilder } = require("discord.js");
const { execute } = require("../../src/commands/User/Auth.js");
const Users = require("../../src/models/User/Users.js");
const { Op } = require("sequelize");
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

describe("/empezar command - Integration Tests", () => {
  test("Debe manejar errores inesperados sin romper el bot", async () => {
    // Se simula un error inesperado en la verificación de roles.
    const interaction = {
      user: { id: "123", email: "123e@gmail.com"},
      member: { roles: { cache: new Map() } },
      reply: jest.fn(),
    };

    const user = await Users.findOne({
      where: {
          [Op.or]: [{ userId: interaction.user.id }, { email: interaction.user.email }],
        },
    });

    if(user == null){
      //Lanza un error en el caso de que no encuentre al usuario en la bd.
      interaction.member.roles.cache.has = () => {
        throw new Error("Simulated unexpected error");
      };
    }

    await expect(execute(interaction)).rejects.toThrow(
      "Simulated unexpected error"
    );
  });

  test("Debe enviar un embed de alerta si el usuario ya está registrado", async () => {
    // En este caso el usuario ya está registrado, es decir, NO tiene el rol de NO_VERIFIED.
    const interaction = {
      member: { roles: { cache: new Map() } },
      reply: jest.fn(),
    };

    // Simula que el usuario no posee el rol que indica que está pendiente de verificación.
    interaction.member.roles.cache.has = (roleId) => {
      return false;
    };

    await execute(interaction);

    // Se espera que se envíe una respuesta efímera con un embed de alerta.
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.any(Array),
        ephemeral: true,
      })
    );

    const embed = interaction.reply.mock.calls[0][0].embeds[0];

    expect(embed).toBeInstanceOf(EmbedBuilder);
    // Se asume que el embed generado por createAlertEmbed incluye en su descripción el mensaje "Ya estás registrado en Be+"
    expect(embed.data.description).toContain("Ya estás registrado en Be+");
  });

  test("Debe enviar un embed de bienvenida si el usuario no está registrado", async () => {
    // En este caso se asume que el usuario aún no está registrado,
    // por lo que posee el rol NO_VERIFIED.
    const interaction = {
      member: { roles: { cache: new Map() } },
      reply: jest.fn(),
    };

    // Simula que el usuario posee el rol NO_VERIFIED
    interaction.member.roles.cache.has = (roleId) => {
      return roleId === process.env.DISCORD_NOT_VERIFICATED_ROLE;
    };

    await execute(interaction);

    // Se espera que se envíe una respuesta con el embed de bienvenida.
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.any(Array),
      })
    );

    const embed = interaction.reply.mock.calls[0][0].embeds[0];

    expect(embed).toBeInstanceOf(EmbedBuilder);
    expect(embed.data.title).toEqual("¡Bienvenido a Be Plus! 🎉");
    expect(embed.data.description).toContain("[Autenticarme]");
  });
});
