const { describe} = require("node:test");
const { getRockie, createRockie, renderRockie } = require("../src/services/rockie/rockieService");
const UserService = require("../src/services/user/userService");
const Users = require("../src/models/User/Users");
const { Op } = require("sequelize");
const Rockie = require("../src/models/Rockie/Rockie");
const {execute} = require("../src/commands/Rockie/rockie");

//External Functions:
async function deleteRockie(userId) {
    const rockie = await getRockie(userId);
    if (!rockie) return null;
    await rockie.destroy();
}

// Connect to the DB
const { sequelize } = require("../src/config/database");

beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

});

afterAll(async () => {
    await sequelize.close(); // Close BD connection
});

describe("Pruebas con base de datos", () => {

    beforeEach(async () => {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });    
    });

    afterEach(async () => {
        // Delete the false data created by the test
        // Don't do it in this case because we need the data to test the command
    });

    test("Debe encontrar al usuario en la base de datos", async () => {
        
        const user = await Users.findOne({
            where: {
                [Op.or]: [{ userId: "1351356333471039630" }, { email: "david.huette@utec.edu.pe" }],
              },
        });

        expect(user).not.toBeNull();
        expect(user.email).toBe("david.huette@utec.edu.pe");
        expect(user.rockyCoins).toBe(0);
        expect(user.rockyGems).toBe(0);
    });

});