const express = require('express');
const User = require('./../models/User');
const { sendWelcomeEmail } = require('./../email/send-mail');

const router = express.Router();

router.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.username);
    const token = await user.generateToken();
    res.status(201).json({ user: user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateToken();
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
