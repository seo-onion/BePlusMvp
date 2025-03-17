const { it, describe} = require("node:test");
const { execute } = require("../src/commands/User/Me.js");
const { getUserProfile } = require("../src/services/user/userService.js");
const  createErrorEmbed  = require("../src/utils/embed/errorEmbed.js");
const {EmbedBuilder} = require("discord.js");
const { getAchievementById } = require("../src/services/achievement/achievementService.js");
const Users = require("../src/models/User/Users");
const UserAchievements = require("../src/models/Achievement/UserAchievements");

//Mocks
jest.mock("../src/services/user/userService.js", () => ({
    getUserProfile: jest.fn(),
  }));
jest.mock("../src/utils/embed/errorEmbed.js",()=> jest.fn());
jest.mock("../src/models/Achievement/UserAchievements.js", () => ({
    findAll: jest.fn(),
  }));
jest.mock("../src/models/User/Users", () => ({
    findByPk: jest.fn(),
  }));
jest.mock("../src/models/Achievement/UserAchievements.js", () => ({
    findAll: jest.fn(),
  }));

jest.mock("../src/services/achievement/achievementService.js", () => ({
    getAchievementById: jest.fn(),
  }));



//Comands test:
    //Comand /yo 
describe("Comando /yo", () => {
  let interaction;

    interaction = {
      commandName: "yo",
      user: { id: "123456789" },
      editReply: jest.fn(),
      replied: false,
      deferred: false,
    };

  //Test 1: Error Test
  test("Debe responder con un error si no se encuentra el perfil", async () => {
    getUserProfile.mockResolvedValue(null);
    createErrorEmbed.mockReturnValue({ title: "Error", description: "No se encontró tu perfil." });

    await execute(interaction);

    expect(getUserProfile).toHaveBeenCalledWith("123456789");
    expect(createErrorEmbed).toHaveBeenCalledWith("No se encontró tu perfil.");
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [{ title: "Error", description: "No se encontró tu perfil." }] });
  });

  //Test 2: Right Answer Test // the test will fail because the function works with the models and the database
  test("Debe devolver la información del usuario cuando existe", async () => {

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

    //should be with real achievements id in the database
    const mockAchievements = [];
    const mockAchievementDetails = [];

    //debug console.log
    console.log(getUserProfile);
    console.log(getAchievementById);


    getUserProfile.mockResolvedValue(mockProfile);
    Users.findByPk.mockResolvedValue(mockUserRecord);
    UserAchievements.findAll.mockResolvedValue(mockAchievements);
    getAchievementById.mockImplementation(id => Promise.resolve(mockAchievementDetails.find(a => a.achievementId === id)));

    await execute(interaction);

    expect(interaction.editReply).toHaveBeenCalledWith({
      embeds: expect.any(Array),
    });

    const embed = interaction.editReply.mock.calls[0][0].embeds[0];
    expect(embed).toBeInstanceOf(EmbedBuilder);
    expect(embed.data.title).toContain("Perfil de UsuarioEjemplo");
    expect(embed.data.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "👤 Nombre", value: "UsuarioEjemplo" }),
        expect.objectContaining({ name: "🏷️ Apodo", value: "Ejemplo123" }),
        expect.objectContaining({ name: "📅 Edad", value: "25 años" }),
        expect.objectContaining({ name: "⚧️ Género", value: "Masculino" }),
        expect.objectContaining({ name: "🪙 RockyCoins", value: "100 RockyCoins" }),
        expect.objectContaining({ name: "💎 RockyGems", value: "50 RockyGems" }),
        expect.objectContaining({ name: "🏅 Logros Desbloqueados", value: "Aún no tienes logros. ¡Desbloquea algunos usando `/desbloquear`!" }),
      ])
    );
  });
});