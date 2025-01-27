const { google } = require('googleapis');

// Define los scopes necesarios para Google Fit
const SCOPES = ['https://www.googleapis.com/auth/fitness.activity.read'];

class GoogleFit {
  constructor(clientId, clientSecret, redirectUri) {
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  // Generar la URL de autenticación
  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
  }

  // Intercambiar el código por un token de acceso
  async getAccessToken(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  // Obtener los pasos desde Google Fit
  async getSteps(startDate, endDate) {
    const fitness = google.fitness({ version: 'v1', auth: this.oauth2Client });

    const response = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
        bucketByTime: { durationMillis: 86400000 }, // Agrupar por día
        startTimeMillis: startDate.getTime(),
        endTimeMillis: endDate.getTime(),
      },
    });

    return response.data.bucket.map(bucket => ({
      date: new Date(parseInt(bucket.startTimeMillis)).toISOString().split('T')[0],
      steps: bucket.dataset[0]?.point[0]?.value[0]?.intVal || 0,
    }));
  }
}

module.exports = GoogleFit;
