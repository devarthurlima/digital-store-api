const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function register(req, res) {
  try {
    const { firstname, surname, email, password, confirmPassword } = req.body;

    if (!firstname || !surname || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "A confirmação de senha não confere" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstname,
      surname,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      id: user.id,
      firstname: user.firstname,
      surname: user.surname,
      email: user.email,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function generateToken(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Credenciais inválidas" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ["id", "firstname", "surname", "email"],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { firstname, surname, email } = req.body;

    if (!firstname || !surname || !email) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await user.update({ firstname, surname, email });
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  register,
  generateToken,
  getById,
  update,
  remove,
};
