const request = require('supertest');
const app = require('../../app');
const { monogConnect, mongoDisconnect } = require('../../services/mongo');
const { loadPlantesData } = require('../../models/plantes.model');

describe('Launches API', () => {
  beforeAll(async () => {
    await monogConnect();
    await loadPlantesData();
  });
  afterAll(async () => {
    await mongoDisconnect();
  });
  describe('TEST GET /launches', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.statusCode).toBe(200);
    });
  });

  describe('TEST POST /launches', () => {
    const completeLaunchData = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701',
      target: 'Kepler-62 f',
      launchDate: 'January 4, 2028'
    };

    const completeLaunchDataWithData = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701',
      target: 'Kepler-62 f'
    };

    const launchDataWithInvalidDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701',
      target: 'Kepler-62 f',
      launchDate: 'Edison'
    };

    test('It should respond with 201 success', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send({
          mission: 'USS Enterprise',
          rocket: 'NCC 1701',
          target: 'Kepler-62 f',
          launchDate: 'January 4, 2028'
        })
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(completeLaunchDataWithData);
    });

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchDataWithData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property'
      });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date'
      });
    });
  });
});
