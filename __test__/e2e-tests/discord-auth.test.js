require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const app = require("../../src/index"); 

// Mocks
jest.mock('../../src/services/token/tokenService', () => ({
  getOAuthToken: jest.fn(() => Promise.resolve({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token'
  }))
}));

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({
    data: { id: '123456789', email: 'test@example.com' }
  }))
}));

jest.mock('../../src/services/user/userService', () => ({
  createUser: jest.fn(() => Promise.resolve({
    userId: '123456789',
    email: 'test@example.com'
  })),
  assignRoleToUser: jest.fn(() => Promise.resolve())
}));

jest.mock('../../src/services/notification/privateNotificationService', () => ({
  sendPrivateChannelNotification: jest.fn(() => Promise.resolve())
}));

describe('E2E: Discord OAuth', () => {
  test('Debe registrar correctamente a un usuario con Discord OAuth', async () => {
    const response = await request(app).get('/auth/discord/callback?code=fakecode');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Felicidades, acabas de registrarte en Be+');

    const { getOAuthToken } = require('../src/services/token/tokenService');
    const axios = require('axios');
    const userService = require('../src/services/user/userService');
    const notificationService = require('../src/services/notification/privateNotificationService');

    expect(getOAuthToken).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledWith(
      'https://discord.com/api/users/@me',
      expect.objectContaining({
        headers: { Authorization: 'Bearer mock-access-token' }
      })
    );
    expect(userService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: '123456789',
        email: 'test@example.com',
        token: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      })
    );
    expect(userService.assignRoleToUser).toHaveBeenCalledWith(
      expect.objectContaining({
        guildId: process.env.DISCORD_GUILD_ID,
        userId: '123456789',
        roleId: process.env.DISCORD_VERIFICATED_ROLE
      })
    );
    expect(notificationService.sendPrivateChannelNotification).toHaveBeenCalledWith(
      '123456789',
      expect.stringContaining('registrado')
    );
  });

  test('Debe fallar si no se recibe el código', async () => {
    const response = await request(app).get('/auth/discord/callback');
    expect(response.status).toBe(400);
    expect(response.text).toBe('No se recibió el código de autorización.');
  });
});
