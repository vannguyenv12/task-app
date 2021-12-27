const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/User');
const auth = require('./../middleware/auth');
const { sendCancelEmail } = require('./../email/send-mail');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  res.status(200).json(req.user);
});

router.patch('/me', auth, async (req, res) => {
  try {
    const keysUpdate = Object.keys(req.body);

    keysUpdate.forEach((field) => (req.user[field] = req.body[field]));
    await req.user.save();
    res.status(200).json(req.user);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete('/me', auth, async (req, res) => {
  try {
    sendCancelEmail(req.user.email, req.user.name);
    await req.user.remove();
    res.status(204).json();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.status(200).json();
  } catch (error) {
    res.status(400).json();
  }
});

router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).json();
  } catch (error) {
    res.status(400).json();
  }
});

// UPLOAD AVATAR
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('File should be image'));
    }
    cb(undefined, true);
  },
});

router.post(
  '/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      req.user.avatar = buffer;
      await req.user.save();
      res.status(200).json();
    } catch (e) {
      res.status(500).json();
    }
  },
  (error, req, res, next) => {
    res.status(400).json({ error: error.message });
  }
);

router.delete('/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.status(200).json();
});

router.get('/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) throw new Error();

    res.set('Content-type', 'image/png');
    res.status(200).send(user.avatar);
  } catch (error) {
    res.status(400).json();
  }
});

module.exports = router;
