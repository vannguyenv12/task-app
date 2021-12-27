jest.setTimeout(30000);
const request = require('supertest');
const app = require('./../app');

test('Should be signup user', async () => {
  await request(app)
    .post('/api/v1/users/')
    .send({
      username: 'test',
      email: 'test@example.com',
      password: 'Mytest222!',
    })
    .expect(201);
});
