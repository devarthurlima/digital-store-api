# Digital Store API

API RESTful desenvolvida em Node.js com Express, Sequelize e MySQL para gerenciamento de usuários, autenticação JWT, categorias e catálogo de produtos.

## Tecnologias Utilizadas

- **Node.js** & **Express**
- **Sequelize ORM** & **MySQL**
- **JSON Web Token (JWT)** & **Bcrypt** para autenticação e criptografia de senhas
- **Jest** & **Supertest** para testes de integração
- **GitHub Actions** para integração contínua (CI)

## Pré-requisitos

- Node.js (v18 ou superior)
- MySQL (v8.0 ou superior)

## Instalação e Configuração

1. Clone o repositório:
   ```bash
   git clone [https://github.com/devarthurlima/digital-store-api.git](https://github.com/devarthurlima/digital-store-api.git)
   cd digital-store-api
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto:
   ```env
   PORT=3000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASS=sua_senha
   DB_NAME=digital_store
   DB_DIALECT=mysql
   JWT_SECRET=sua_chave_secreta
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```
   Para desenvolvimento com reinicialização automática:
   ```bash
   npm run dev
   ```

## Testes Automatizados

Para executar a suíte de testes de integração localmente (requer instância MySQL ativa):

```bash
npm test
```

Os testes também são executados automaticamente em nuvem via **GitHub Actions** a cada `push` ou `pull_request` nas branches principais.

## Endpoints da API

### Usuários e Autenticação
- `POST /v1/user` — Cadastra um novo usuário
- `POST /v1/user/token` — Autentica e retorna o token JWT
- `GET /v1/user/:id` — Retorna os dados de um usuário por ID
- `PUT /v1/user/:id` — Atualiza os dados do usuário *(requer token JWT)*
- `DELETE /v1/user/:id` — Remove um usuário *(requer token JWT)*

### Categorias
- `GET /v1/category/search` — Lista categorias com paginação (`limit`, `page`, `fields`, `use_in_menu`)
- `GET /v1/category/:id` — Busca categoria por ID
- `POST /v1/category` — Cria uma nova categoria *(requer token JWT)*
- `PUT /v1/category/:id` — Atualiza uma categoria *(requer token JWT)*
- `DELETE /v1/category/:id` — Remove uma categoria *(requer token JWT)*

### Produtos
- `GET /v1/product/search` — Busca produtos com filtros (`limit`, `page`, `match`, `category_ids`, `price-range`, `option[id]`)
- `GET /v1/product/:id` — Retorna os detalhes completos de um produto (categorias, imagens e opções)
- `POST /v1/product` — Cadastra um produto completo *(requer token JWT)*
- `PUT /v1/product/:id` — Atualiza um produto e gerencia imagens/opções (`deleted: true`) *(requer token JWT)*
- `DELETE /v1/product/:id` — Remove um produto *(requer token JWT)*