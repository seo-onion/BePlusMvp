require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const app = require('../../src/index');

// Mocks
jest.mock('../../src/services/token/tokenService', () => ({
  getOAuthToken: jest.fn(() => Promise.resolve({
    access_token: 'mock-google-access-token',
    refresh_token: 'mock-google-refresh-token'
  }))
}));

jest.mock('../../src/services/user/userService', () => ({
  editUser: jest.fn(() => Promise.resolve({
    userId: '123456789',
    googleToken: 'mock-google-access-token'
  }))
}));

jest.mock('../../src/services/notification/privateNotificationService', () => ({
  sendPrivateChannelNotification: jest.fn(() => Promise.resolve())
}));

describe('E2E: Google Fit OAuth', () => {
  test('Debe vincular exitosamente con Google Fit', async () => {
    const response = await request(app)
      .get('/auth/google/callback?code=fake-google-code&state=123456789');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Vinculado correctamente');

    const { getOAuthToken } = require('../src/services/token/tokenService');
    const userService = require('../src/services/user/userService');
    const notificationService = require('../src/services/notification/privateNotificationService');

    expect(getOAuthToken).toHaveBeenCalled();
    expect(userService.editUser).toHaveBeenCalledWith({
      identifier: '123456789',
      googleToken: 'mock-google-access-token',
      googleRefreshToken: 'mock-google-refresh-token'
    });
    expect(notificationService.sendPrivateChannelNotification).toHaveBeenCalledWith(
      '123456789',
      expect.stringContaining('Google Fit')
    );
  });

  test('Debe devolver error si falta el state (user ID)', async () => {
    const response = await request(app).get('/auth/google/callback?code=fake-google-code');
    expect(response.status).toBe(400);
    expect(response.text).toBe('Error: User ID is missing.');
  });

  test('Debe devolver error si falta el código', async () => {
    const response = await request(app).get('/auth/google/callback?state=123456789');
    expect(response.status).toBe(400);
    expect(response.text).toBe('Error: CODE is missing.');
  });
});
