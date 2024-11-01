const { User } = require('../models/user');
const { ObjectId } = require('mongodb');
const _ = require('lodash');

exports.createUser = async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password', 'displayName']);
    const user = new User(body);
    const existingUser = await User.findOne({ email: body.email });
    
    if (existingUser) {
      return res.status(400).send({ error: 'Email already exists.' });
    }
    await user.save();
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ error: 'Invalid user ID' });

    const user = await User.findById(id).select('-password -tokens');
    if (!user) return res.status(404).send({ error: 'User not found' });

    res.status(200).send({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(401).send({ error: 'The email or password you entered is incorrect. Please try again.' });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
};
