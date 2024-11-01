const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
    lowercase: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  displayName: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 12
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  postHistory: [{
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]

});

UserSchema.plugin(uniqueValidator, { message: 'The {PATH} {VALUE} is already in use. Please use another.' });

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email', 'displayName', 'role']);
};
UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const _id = user._id.toHexString();
  
  const token = jwt.sign(
    { _id, role: user.role, displayName: user.displayName }, 
    process.env.JWT_SECRET
  );

  // Update the tokens array directly using findByIdAndUpdate
  await User.findByIdAndUpdate(
    _id,
    { $push: { tokens: { token } } },
    { new: true }
  );

  return token;
};

UserSchema.methods.removeToken = function (token) {
  const user = this;
  return user.updateOne({
    $pull: {
      tokens: { token }
    }
  });
};

UserSchema.statics.findByToken = function (token) {
  const User = this;
  let decoded;
  
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token
  });
};

UserSchema.statics.findByCredentials = async function (email, password) {
  const User = this;
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid password');
  }

  return user;
};

UserSchema.pre('save', async function (next) {
  const user = this;
  
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
