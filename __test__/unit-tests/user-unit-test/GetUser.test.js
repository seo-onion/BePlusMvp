const axios = require('axios');
const Users = require('../../../src/models/User/Users');
const { refreshDiscordToken } = require('../../../src/services/token/tokenService');
const UserService = require('../../../src/services/user/userService');
const { Op } = require('sequelize');

// Mock explicit axios methods
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

// Mock the Users model simulating Sequelize instances
jest.mock('../../../src/models/User/Users', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}));

// Mock refreshDiscordToken
jest.mock('../../../src/services/token/tokenService', () => ({
  refreshDiscordToken: jest.fn(),
}));

const GUILD_ID = '123456';
const BOT_TOKEN = 'mocked-bot-token';

describe('UserService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GUILD_ID = GUILD_ID;
    process.env.BOT_TOKEN = BOT_TOKEN;
  });

  describe('getUser', () => {


    it('should find user by userId', async () => {
      const mockUser = { userId: 'user123', email: 'user@example.com' };
      Users.findOne.mockResolvedValue(mockUser);

      const result = await UserService.getUser('user123');

      expect(result).toEqual(mockUser);
      expect(Users.findOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ userId: 'user123' }, { email: 'user123' }],
        },
        include: [expect.anything(), expect.anything()],
      });
    });


    it('should find user by email', async () => {
      const mockUser = { userId: 'user456', email: 'test@example.com' };
      Users.findOne.mockResolvedValue(mockUser);

      const result = await UserService.getUser('test@example.com');

      expect(result).toEqual(mockUser);
      expect(Users.findOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ userId: 'test@example.com' }, { email: 'test@example.com' }],
        },
        include: [expect.anything(), expect.anything()],
      });
    });


    it('should return null when user is not found', async () => {
      Users.findOne.mockResolvedValue(null);

      const result = await UserService.getUser('nonexistent-user');

      expect(result).toBeNull();
      expect(Users.findOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ userId: 'nonexistent-user' }, { email: 'nonexistent-user' }],
        },
        include: [expect.anything(), expect.anything()],
      });
    });


    it('should return null and log error when an exception occurs', async () => {
      const mockError = new Error('Database Error');
      Users.findOne.mockRejectedValue(mockError);
      console.error = jest.fn();

      const result = await UserService.getUser('user123');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith("Error to obtain user: ", mockError.message);
    });


    it('should return user with null Auth and Profile if relations are not present', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'user@example.com',
        Auth: null,
        Profile: null,
      };

      Users.findOne.mockResolvedValue(mockUser);

      const result = await UserService.getUser('user123');

      expect(result).toEqual(mockUser);
      expect(result.Auth).toBeNull();
      expect(result.Profile).toBeNull();
    });


    it('should return user with Auth and Profile when relations are present', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'user@example.com',
        Auth: { id: 'auth123', lastLogin: new Date() },
        Profile: { id: 'profile123', age: 25 },
      };

      Users.findOne.mockResolvedValue(mockUser);

      const result = await UserService.getUser('user123');

      expect(result).toEqual(mockUser);
      expect(result.Auth).toEqual({
        id: 'auth123',
        lastLogin: expect.any(Date),
      });
      expect(result.Profile).toEqual({
        id: 'profile123',
        age: 25,
      });
    });

  });

});
