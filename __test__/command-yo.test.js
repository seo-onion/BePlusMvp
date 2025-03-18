const { it, describe, before} = require("node:test");
const { execute } = require("../src/commands/User/Me.js");
const { getUserProfile } = require("../src/services/user/userService.js");
const  createErrorEmbed  = require("../src/utils/embed/errorEmbed.js");
const Auth = require("../src/models/User/Auth.js");
const { Op } = require("sequelize");
const {EmbedBuilder} = require("discord.js");
const { getAchievementById } = require("../src/services/achievement/achievementService.js");
const Users = require("../src/models/User/Users.js");
const UserAchievements = require("../src/models/Achievement/UserAchievements.js");
const Profile = require("../src/models/User/Profile.js");

// Connect to the DB
const { sequelize } = require("../src/config/database");

beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

});

afterAll(async () => {
    await sequelize.close(); // Close BD connection
});

//Command /yo test:

describe("Comando /yo", () => {
  let interaction;

  //Test 1: Error Test
  test("Debe responder con un error si no se encuentra el perfil", async () => {

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
          include: [ Auth , Profile]
        },
    });

    expect(user).toBeNull();

    await execute(interaction);

    expect(interaction.deferReply).toHaveBeenCalled();
  
    expect(interaction.editReply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: [expect.objectContaining({
          title: expect.stringContaining("Error"),
          description: expect.stringContaining("No se encontró tu perfil"),
        })]
      })
    );

  });

  //Test 2: Right Answer Test // the test should fail because the function works with the models and the database but we are mocking the data.
  test("Debe devolver la información del usuario cuando existe", async () => {
    interaction = {
      commandName: "yo",
      user: { id: "123456789" },
      deferReply: jest.fn(),
      editReply: jest.fn(),
      replied: false,
      deferred: false,
    };

    //Should be with a real user in the database
    const mockProfile = {
      name: "UsuarioEjemplo",
      nickname: "Ejemplo123",
      description: "Este es un perfil de prueba.",
      age: 20,
      gender: "Masculino",
    };

    const mockUserRecord = {
      rockyCoins: 100,
      rockyGems: 50,
    };

    //should be with real achievements in the database
    const mockAchievements = [];
    const mockAchievementDetails = [];

    getUserProfile.mockResolvedValue(mockProfile);
    Users.findByPk.mockResolvedValue(mockUserRecord);
    UserAchievements.findAll.mockResolvedValue(mockAchievements);
    getAchievementById.mockImplementation(id => Promise.resolve(mockAchievementDetails.find(a => a.achievementId === id)));

    await execute(interaction);

    expect(interaction.editReply).toHaveBeenCalledWith({
      embeds: expect.any(Array),
    });

    console.log(interaction.editReply.mock.calls[0][0]);

    const embed = interaction.editReply.mock.calls[0][0].embeds[0];
    expect(embed).toBeInstanceOf(EmbedBuilder);
    expect(embed.data.title).toContain("Perfil de Usuario");
    expect(embed.data.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({inline: true, name: "👤 Nombre", value: "UsuarioEjemplo" }),
        expect.objectContaining({inline: true, name: "🏷️ Apodo", value: "Ejemplo123" }),
        expect.objectContaining({inline: true, name: "📅 Edad", value: "20 años" }),
        expect.objectContaining({inline: true, name: "⚧️ Género", value: "Masculino" }),
        expect.objectContaining({inline: true, name: "🪙 RockyCoins", value: "100 RockyCoins" }),
        expect.objectContaining({inline: true, name: "💎 RockyGems", value: "50 RockyGems" }),
        expect.objectContaining({inline: false, name: "🏅 Logros Desbloqueados", value: "Aún no tienes logros. ¡Desbloquea algunos usando `/desbloquear`!" }),
      ])
    );
  });
});