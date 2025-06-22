const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../data/dbConfig');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const existing = await db('users').where('username', username).first();
    if (existing) {
      return res.status(400).json({ message: "username taken" });
    }

    const hash = bcrypt.hashSync(password, 8);
    const [newUser] = await db('users').insert({
      username,
      password: hash
    }, ['id', 'username', 'password']);

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const user = await db('users').where('username', username).first();
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.SECRET || "shh",
      { expiresIn: '1d' }
    );

    res.json({
      message: `welcome, ${username}`,
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;