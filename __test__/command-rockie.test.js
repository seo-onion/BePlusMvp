const { describe} = require("node:test");
const { getRockie, createRockie, renderRockie } = require("../src/services/rockie/rockieService");
const Users = require("../src/models/User/Users");
const {execute} = require("../src/commands/Rockie/rockie");

//Mocks
jest.mock("../src/models/User/Users", () => ({
    findByPk: jest.fn(),
}));
jest.mock("../src/services/rockie/rockieService", () => ({
    getRockie: jest.fn(),
    createRockie: jest.fn(),
    renderRockie: jest.fn(),
}));


//Commands /rockie test:
describe("Comando /rockie", () => {
    let interaction;

    //Test 1: Error Test
    test("Debe crear un nuevo rockie si el usuario no tiene uno",async ()=>{
        interaction = {
            commandName: "yo",
            user: { id: "123456789" },
            editReply: jest.fn(),
            replied: false,
            deferred: false,
          };
        
        getRockie.mockResolvedValue(null);
    
        await execute(interaction);

        expect(getRockie).toHaveBeenCalledWith("123456789");
        expect(createRockie).toHaveBeenCalled();
        expect(interaction.editReply).toHaveBeenCalledWith("❌ No se pudo generar la imagen de tu Rockie.");
    });
});