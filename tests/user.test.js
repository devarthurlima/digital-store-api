const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const { User } = require('../src/models');

describe('Módulo de Usuários e Autenticação', () => {
  let userId;
  let authToken;
  const userEmail = `user_${Date.now()}@digitalstore.com`;

  beforeAll(async () => {
    await sequelize.sync();
  });

  afterAll(async () => {
    if (userId) {
      await User.destroy({ where: { id: userId } });
    }
    await sequelize.close();
  });

  it('Deve cadastrar um novo usuário com sucesso (POST /v1/user)', async () => {
    const res = await request(app).post('/v1/user').send({
      firstname: 'Arthur',
      surname: 'Lima',
      email: userEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });

    if (res.status !== 201) console.log('Erro POST /v1/user:', res.body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    userId = res.body.id;
  });

  it('Deve gerar um token JWT válido (POST /v1/user/token)', async () => {
    const res = await request(app).post('/v1/user/token').send({
      email: userEmail,
      password: 'Password123!'
    });

    if (res.status !== 200) console.log('Erro POST /v1/user/token:', res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    authToken = res.body.token;
  });

  it('Deve retornar os dados do usuário por ID (GET /v1/user/:id)', async () => {
    const res = await request(app).get(`/v1/user/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(userEmail);
  });

  it('Deve atualizar o usuário autenticado (PUT /v1/user/:id)', async () => {
    const res = await request(app)
      .put(`/v1/user/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstname: 'Arthur Atualizado',
        surname: 'Lima',
        email: userEmail
      });

    expect(res.status).toBe(204);
  });

  it('Deve bloquear atualização sem token JWT', async () => {
    const res = await request(app)
      .put(`/v1/user/${userId}`)
      .send({
        firstname: 'Sem Token',
        surname: 'Lima',
        email: userEmail
      });

    expect([400, 401]).toContain(res.status);
  });

  it('Deve remover o usuário autenticado (DELETE /v1/user/:id)', async () => {
    const res = await request(app)
      .delete(`/v1/user/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(204);
    userId = null;
  });
});