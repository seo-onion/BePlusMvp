const { describe } = require("node:test");
const { execute } = require("../src/commands/User/Auth");
const createAlertEmbed = require("../src/utils/embed/alertEmbed");

jest.mock("../src/utils/embed/alertEmbed", () => jest.fn());

// Command /empezar test
describe("/empezar command - Error Handling", () => {
    let interaction;
    
    //Test 1: Unexpected Error
    test("Debe manejar errores inesperados sin romper el bot", async () => {
        interaction = {
            member: { roles: { cache: new Map() } },
            reply: jest.fn(),
          };

      // Simular un error lanzado dentro del comando
      interaction.member.roles.cache.has = jest.fn(() => {
        throw new Error("Simulated unexpected error");
      });
  
      await expect(execute(interaction)).rejects.toThrow("Simulated unexpected error");
    });
  
    //Test 2: User Already Registered
    test("Debe enviar un embed de alerta si el usuario ya está registrado", async () => {
        interaction = {
            member: { roles: { cache: new Map() } },
            reply: jest.fn(),
          };

      interaction.member.roles.cache.has = jest.fn(() => false); // Usuario ya registrado
      const mockEmbed = { description: "Ya estás registrado en Be+" };
      createAlertEmbed.mockReturnValue(mockEmbed);
  
      await execute(interaction);
  
      expect(interaction.reply).toHaveBeenCalledWith({ embeds: [mockEmbed], ephemeral: true });
    });
  });
  