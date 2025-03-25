const axios = require('axios');
const Users = require('../../../src/models/User/Users');
const Auth = require('../../../src/models/User/Auth');
const Profile = require('../../../src/models/User/Profile');
const UserService = require('../../../src/services/user/userService');

// Mock axios methods
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

// Mock Users model
jest.mock('../../../src/models/User/Users', () => ({
  findOne: jest.fn(),
}));

// Mock Auth and Profile models
jest.mock('../../../src/models/User/Auth');
jest.mock('../../../src/models/User/Profile');

const GUILD_ID = '123456';
const BOT_TOKEN = 'mocked-bot-token';

describe('UserService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GUILD_ID = GUILD_ID;
    process.env.BOT_TOKEN = BOT_TOKEN;
  });

  describe('deleteUser', () => {

    // ✅ Test 1: Eliminar usuario correctamente cuando existe
    it('should delete the user when it exists', async () => {
      const mockUser = {
        userId: 'user123',
        destroy: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUser);

      const result = await UserService.deleteUser('user123');

      expect(result).toEqual(mockUser);
      expect(mockUser.destroy).toHaveBeenCalledTimes(1);
    });

    // ✅ Test 2: Retornar null cuando el usuario no existe
    it('should return null when the user is not found', async () => {
      jest.spyOn(UserService, 'getUser').mockResolvedValue(null);
      console.error = jest.fn();

      const result = await UserService.deleteUser('nonexistent-user');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('User not found');
    });

    // ✅ Test 3: Retornar null y loguear error cuando ocurre una excepción
    it('should return null and log an error if an exception occurs', async () => {
      const mockError = new Error('Database Error');
      jest.spyOn(UserService, 'getUser').mockRejectedValue(mockError);
      console.error = jest.fn();

      const result = await UserService.deleteUser('user123');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error deleting user:', mockError.message);
    });

  });

});
