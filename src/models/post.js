const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 60,
    trim: true
  },
  author: {
    type: String
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  category: {
    type: String,
    minlength: 4,
    maxlength: 16,
    default: 'General'
  },
  body: {
    type: String,
    required: true,
    minlength: 24,
    maxlength: 13468,
    trim: true
  },
  comments: [{
    comment: {
      type: String,
      minlength: 8,
      maxlength: 128
    },
    date: {
      type: Number,
      default: Date.now
    }, 
    createdBy: String
  }]
});

PostSchema.index({ title: 'text', body: 'text', category: 'text' });

PostSchema.index({ category: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', PostSchema);

module.exports = {Post};