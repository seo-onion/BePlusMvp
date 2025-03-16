const { it, describe} = require("node:test");
const { execute } = require("../src/commands/User/Me.js");
const { getUserProfile } = require("../src/services/user/userService.js");
const  createErrorEmbed  = require("../src/utils/embed/errorEmbed.js");

//Mocks
jest.mock("../src/services/user/userService.js", () => ({
    getUserProfile: jest.fn(),
  }));
jest.mock("../src/utils/embed/errorEmbed.js",()=> jest.fn());


//Comands test
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

  test("Debe responder con un error si no se encuentra el perfil", async () => {
    getUserProfile.mockResolvedValue(null);
    createErrorEmbed.mockReturnValue({ title: "Error", description: "No se encontró tu perfil." });

    await execute(interaction);

    expect(getUserProfile).toHaveBeenCalledWith("123456789");
    expect(createErrorEmbed).toHaveBeenCalledWith("No se encontró tu perfil.");
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [{ title: "Error", description: "No se encontró tu perfil." }] });
  });
});