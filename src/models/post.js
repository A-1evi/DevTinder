const mongoose = require('mongoose');
const User = require("./user");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 3; // Limit the number of tags
        },
        message: 'A post can have a maximum of 3 tags.',
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming you have a User model
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    // You could add fields for images or links if you plan to implement those features
    // imageUrl: {
    //   type: String,
    // },
    // linkUrl: {
    //   type: String,
    // },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;