require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/database");
require("./models");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log(
      "Conexão com o banco de dados MySQL estabelecida com sucesso.",
    );

    await sequelize.sync({ alter: true });
    console.log("Tabelas sincronizadas no MySQL.");

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Não foi possível conectar ao banco de dados:",
      error.message,
    );
    process.exit(1);
  }
}

startServer();
