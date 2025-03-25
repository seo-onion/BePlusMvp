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
  findAll: jest.fn(),
}));

// Mock Auth and Profile models (si los necesitas en otros tests)
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

  describe('getAllUsers', () => {
    
    // ✅ Test 1: Retornar usuarios encontrados
    it('should return all users when they exist', async () => {
      const mockUsers = [
        {
          userId: 'user123',
          email: 'user1@example.com',
          Auth: { id: 'auth1' },
          Profile: { id: 'profile1', age: 25 },
        },
        {
          userId: 'user456',
          email: 'user2@example.com',
          Auth: { id: 'auth2' },
          Profile: { id: 'profile2', age: 30 },
        },
      ];

      Users.findAll.mockResolvedValue(mockUsers);

      const result = await UserService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(Users.findAll).toHaveBeenCalledWith({
        include: [Auth, Profile],
      });
    });

    // ✅ Test 2: Retornar null cuando no se encuentran usuarios
    it('should return null when no users are found', async () => {
      Users.findAll.mockResolvedValue([]);

      const result = await UserService.getAllUsers();

      expect(result).toBeNull();
      expect(Users.findAll).toHaveBeenCalledWith({
        include: [Auth, Profile],
      });
    });

    // ✅ Test 3: Retornar null y loguear error cuando ocurre una excepción
    it('should return null and log an error when an exception occurs', async () => {
      const mockError = new Error('Database Error');
      Users.findAll.mockRejectedValue(mockError);
      console.error = jest.fn();

      const result = await UserService.getAllUsers();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith("Error to obtain user: ", mockError.message);
    });

  });

});
