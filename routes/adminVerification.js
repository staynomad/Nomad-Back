const express = require('express');
const jwt = require('jsonwebtoken');

const PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRES_IN;

const router = express.Router();

router.post('/', async (req, res) => {
  const { password } = req.body;
  console.log(req.body, PASSWORD);
  if (password == PASSWORD) {
    const token = await jwt.sign({ type: 'admin' }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });
    res.status(200).json({ success: true, token });
  } else {
    res.status(400).json({ errors: 'Password Incorrect' });
  }
});

module.exports = router;
