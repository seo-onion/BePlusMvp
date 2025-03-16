const { it, describe } = require("node:test");
const { execute } = require("../src/commands/User/Me.js");
const { getUserProfile } = require("../src/services/user/userService.js");
const  createErrorEmbed  = require("../src/utils/errorEmbed.js");

jest.mock("../src/services/user/userService.js", () => ({
    getUserProfile: jest.fn(),
  }));
jest.mock("../src/utils/errorEmbed.js",()=> jest.fn());

describe("Comando /yo", () => {
    let interaction;
  
    beforeEach(() => {
      interaction = {
        commandName: "yo", // ✅ Asegura que se está ejecutando el comando correcto
        user: { id: "123456789" },
        editReply: jest.fn(),
        replied: false,
        deferred: false,
      };
    });
  
    it("Debe responder con un error si no se encuentra el perfil", async () => {
      getUserProfile.mockResolvedValue(null);
      createErrorEmbed.mockReturnValue({ title: "Error", description: "No se encontró tu perfil." });
  
      console.log(`Ejecutando prueba para el comando: ${interaction.commandName}`);
  
      await execute(interaction);
  
      expect(interaction.commandName).toBe("yo");
      expect(getUserProfile).toHaveBeenCalledWith("123456789");
      expect(createErrorEmbed).toHaveBeenCalledWith("No se encontró tu perfil.");
      expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [{ title: "Error", description: "No se encontró tu perfil." }] });
    });
  });