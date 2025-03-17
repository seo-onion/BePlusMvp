const { describe} = require("node:test");
const { getRockie, createRockie, renderRockie } = require("../src/services/rockie/rockieService");
const UserService = require("../src/services/user/userService");
const Users = require("../src/models/User/Users");
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
    await sequelize.close(); // Cerrar la conexión a la BD al finalizar los tests
});

describe("Pruebas con base de datos", () => {
    let testUser;
    let testRockie;
    

    beforeEach(async () => {
        // Crear usuario de prueba
        testUser = await UserService.createUser({
            userId: "test_user_123",
            email: "test@example.com",
            token: "abc123",
            refreshToken: "refresh456",
        });

        // Crear rockie asociado
        testRockie = await createRockie({
            userId: "test_user_123",
            username: "RockieTest"
        });
    });

    afterEach(async () => {
        // Eliminar datos después de cada test
        await UserService.deleteUser("test_user_123");
        await deleteRockie("test_user_123");
    });

    test("Debe encontrar al usuario en la base de datos", async () => {
        const user = await UserService.getUser("test_user_123");
        expect(user).not.toBeNull();
        console.log(user);
        expect(user.email).toBe("test@example.com");
        expect(user.rockyCoins).toBe(500);
    });

    test("Debe encontrar el Rockie asociado al usuario", async () => {
        const rockie = await getRockie("test_user_123");
        console.log(rockie);
        expect(rockie).not.toBeNull();
        expect(rockie.name).toBe("RockieTest");
        expect(rockie.level).toBe(5);
    });
});