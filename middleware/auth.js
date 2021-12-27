const jwt = require('jsonwebtoken');
const User = require('./../models/User');

const auth = async (req, res, next) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  try {
    if (!token) throw new Error();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) throw new Error();

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) throw new Error();

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authentication' });
  }
};

// const auth = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization').replace('Bearer ', '');
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findOne({
//       _id: decoded._id,
//       'tokens.token': token,
//     });

//     if (!user) {
//       throw new Error();
//     }

//     req.token = token;
//     req.user = user;
//     next();
//   } catch (e) {
//     res.status(401).send({ error: 'Please authenticate.' });
//   }
// };

module.exports = auth;
