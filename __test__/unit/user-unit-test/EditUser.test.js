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
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}));

// Mock Auth and Profile models
jest.mock('../../../src/models/User/Auth');
jest.mock('../../../src/models/User/Profile');

const GUILD_ID = '123456';
const BOT_TOKEN = 'mocked-bot-token';
describe('editUser', () => {

    it('should update user, auth, and profile when user exists', async () => {
      const mockUser = {
        userId: 'user123',
        update: jest.fn().mockResolvedValue(true),
        Auth: {
          update: jest.fn().mockResolvedValue(true),
        },
        Profile: {
          update: jest.fn().mockResolvedValue(true),
        },
      };

      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUser);

      const req = {
        identifier: 'user123',
        name: 'Updated Name',
        age: 25,
      };

      const updateFields = {
        name: 'Updated Name',
        age: 25,
      };

      const result = await UserService.editUser(req);

      expect(result).toEqual(mockUser);
      expect(mockUser.update).toHaveBeenCalledWith(updateFields);
      expect(mockUser.Auth.update).toHaveBeenCalledWith(updateFields);
      expect(mockUser.Profile.update).toHaveBeenCalledWith(updateFields);
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(UserService, 'getUser').mockResolvedValue(null);
      console.error = jest.fn();

      const req = {
        identifier: 'nonexistent-user',
        name: 'Updated Name',
      };

      const result = await UserService.editUser(req);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('User not found');
    });

    it('should continue updating other models if one model update fails', async () => {
      const mockUser = {
        userId: 'user123',
        update: jest.fn().mockResolvedValue(true),
        Auth: {
          update: jest.fn().mockRejectedValue(new Error('Auth update failed')),
        },
        Profile: {
          update: jest.fn().mockResolvedValue(true),
        },
      };

      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUser);

      const req = {
        identifier: 'user123',
        name: 'Updated Name',
      };

      const updateFields = {
        name: 'Updated Name',
      };

      const result = await UserService.editUser(req);

      expect(result).toEqual(mockUser);
      expect(mockUser.update).toHaveBeenCalledWith(updateFields);
      expect(mockUser.Auth.update).toHaveBeenCalledWith(updateFields);
      expect(mockUser.Profile.update).toHaveBeenCalledWith(updateFields);
    });


    it('should update only the user when Auth and Profile are null', async () => {
      const mockUser = {
        userId: 'user123',
        update: jest.fn().mockResolvedValue(true),
        Auth: null,
        Profile: null,
      };

      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUser);

      const req = {
        identifier: 'user123',
        name: 'Updated Name',
      };

      const updateFields = {
        name: 'Updated Name',
      };

      const result = await UserService.editUser(req);

      expect(result).toEqual(mockUser);
      expect(mockUser.update).toHaveBeenCalledWith(updateFields);
    });


    it('should return null and log an error if an exception occurs', async () => {
      const mockError = new Error('General Error');
      jest.spyOn(UserService, 'getUser').mockRejectedValue(mockError);
      console.error = jest.fn();

      const req = {
        identifier: 'user123',
        name: 'Updated Name',
      };

      const result = await UserService.editUser(req);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error to update user:', mockError);
    });

});
