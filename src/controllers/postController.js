const { Post } = require("../models/post");
const { User } = require("../models/user");
const { ObjectId } = require("mongodb");
const _ = require("lodash");

exports.getPosts = async (req, res) => {
  try {
    console.log("getting all posts");

    const posts = await Post.find();

    res.status(200).send({ posts });
  } catch (e) {
    console.log(e, "errors");
    res.status(400).send();
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query?.trim()) return res.status(200).json({ posts: [] });

    const posts = await Post.find({
      $or: [
        { title: { $regex: query.trim(), $options: "i" } },
        { author: { $regex: query.trim(), $options: "i" } },
      ],
    }).sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Error searching for posts" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const requiredFields = ["title", "category", "body"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res
        .status(400)
        .send({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
    }

    const body = _.pick(req.body, ["title", "category", "body"]);
    if (!body.title.trim() || !body.body.trim()) {
      return res.status(400).send({ error: "Title and body cannot be empty" });
    }

    const post = new Post({
      title: body.title.trim(),
      category: body.category.trim(),
      author: req.user.displayName,
      body: body.body.trim(),
    });

    await post.save();
    res.status(201).send({ post });
  } catch (e) {
    console.error("Post creation error:", e);
    res.status(400).send({ error: "Could not create post" });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id))
      return res.status(400).send({ error: "Invalid post ID" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).send({ error: "Post not found" });

    const userUpdateResult = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { postHistory: { postId: post._id, timestamp: new Date() } },
      },
      { new: true }
    );

    if (!userUpdateResult)
      return res
        .status(404)
        .send({ error: "User not found, history not updated" });

    res.status(200).send({ post });
  } catch (e) {
    console.error("Error fetching post or updating user history:", e);
    res.status(500).send({ error: "Internal server error" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const id = req.params.id;
    const body = _.pick(req.body, ["title", "category", "body"]);
    const post = await Post.findOneAndUpdate(id, { $set: body }, { new: true });
    res.status(200).send({ post });
  } catch (e) {
    res.status(400).send({ error: "Could not update post." });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) return res.status(400).send();

    // const post = await Post.findByIdAndRemove(id);
    const post = await Post.findById(id);
    if (!post) return res.status(404).send({ error: "Post not found." });
    if (req.user.displayName !== post.author) {
      return res
        .status(403)
        .send({ error: "Unauthorized to delete this post" });
    }

    await Post.findByIdAndRemove(id);

    res.status(200).send({ message: "Post deleted successfully." });
  } catch (e) {
    res.status(400).send();
  }
};

exports.addCommentToPost = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) throw new Error();

    const body = _.pick(req.body, ["comment"]);
    body.createdBy = req.user.displayName;

    const post = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: body } },
      { new: true }
    );
    const comment = _.last(post.comments);
    res.status(200).send(comment);
  } catch (e) {
    res.status(400).send({ error: "Unable to post comment." });
  }
};

exports.deleteCommentFromPost = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    if (!ObjectId.isValid(postId) || !ObjectId.isValid(commentId)) {
      return res.status(400).send({ error: "Invalid post or comment ID" });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    if (!post) return res.status(404).send({ error: "Post not found" });

    res.status(200).send({ message: "Comment deleted successfully" });
  } catch (e) {
    console.error("Error deleting comment:", e);
    res.status(500).send({ error: "Unable to delete comment" });
  }
};
