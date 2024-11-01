const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const requireAdmin = async (req, res, next) => {
  try {
    const token = req.header('x-auth');
    
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      '_id': decoded._id,
      'tokens.token': token,
      'role': 'admin'
    });

    if (!user) {
      throw new Error('Not authorized as admin');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send({
      error: 'You are not authorized to perform this request.'
    });
  }
};

module.exports = { requireAdmin };