const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const requireAuthAsync = async (req, res, next) => {
  try {
    const token = req.header('x-auth');
    
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      '_id': decoded._id,
      'tokens.token': token
    });

    if (!user) {
      throw new Error('User not found or token invalid');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send({
      error: 'Please authenticate.',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
};

module.exports = { requireAuthAsync };