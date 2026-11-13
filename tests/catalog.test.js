const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const { User, Category, Product } = require('../src/models');

describe('Módulos de Categorias e Produtos', () => {
  let authToken;
  let userId;
  let categoryId;
  let productId;

  beforeAll(async () => {
    await sequelize.sync();

    const email = `catalog_${Date.now()}@digitalstore.com`;
    const userRes = await request(app).post('/v1/user').send({
      firstname: 'Tester',
      surname: 'Catalog',
      email,
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    userId = userRes.body.id;

    const tokenRes = await request(app).post('/v1/user/token').send({
      email,
      password: 'Password123!'
    });
    authToken = tokenRes.body.token;
  });

  afterAll(async () => {
    if (productId) await Product.destroy({ where: { id: productId } });
    if (categoryId) await Category.destroy({ where: { id: categoryId } });
    if (userId) await User.destroy({ where: { id: userId } });
    await sequelize.close();
  });

  it('Deve criar uma categoria autenticada (POST /v1/category)', async () => {
    const res = await request(app)
      .post('/v1/category')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Tênis Esportivos',
        slug: `tenis-esportivos-${Date.now()}`,
        use_in_menu: true
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    categoryId = res.body.id;
  });

  it('Deve listar categorias paginadas (GET /v1/category/search)', async () => {
    const res = await request(app).get('/v1/category/search?limit=10&page=1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('Deve cadastrar um produto com categorias e opções (POST /v1/product)', async () => {
    const res = await request(app)
      .post('/v1/product')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        enabled: true,
        name: 'Tênis Runner Pro',
        slug: `tenis-runner-pro-${Date.now()}`,
        stock: 15,
        description: 'Tênis leve para corrida',
        price: 299.90,
        price_with_discount: 249.90,
        category_ids: [categoryId],
        images: [
          {
            type: 'image/png',
            content: 'https://exemplo.com/tenis.png'
          }
        ],
        options: [
          {
            title: 'Tamanho',
            shape: 'square',
            radius: '4px',
            type: 'text',
            values: ['39', '40', '41']
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    productId = res.body.id;
  });

  it('Deve filtrar produtos por texto e categoria (GET /v1/product/search)', async () => {
    const res = await request(app)
      .get(`/v1/product/search?match=Runner&category_ids=${categoryId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('Deve atualizar o produto e remover opção logicamente (PUT /v1/product/:id)', async () => {
    const detailRes = await request(app).get(`/v1/product/${productId}`);
    const optionId = detailRes.body.options[0].id;

    const res = await request(app)
      .put(`/v1/product/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Tênis Runner Pro V2',
        options: [
          { id: optionId, deleted: true }
        ]
      });

    expect(res.status).toBe(204);
  });

  it('Deve deletar o produto e a categoria (DELETE)', async () => {
    const prodDel = await request(app)
      .delete(`/v1/product/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(prodDel.status).toBe(204);
    productId = null;

    const catDel = await request(app)
      .delete(`/v1/category/${categoryId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(catDel.status).toBe(204);
    categoryId = null;
  });
});