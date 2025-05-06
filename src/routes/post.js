// routes/posts.js
const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Post = require("../models/post");
const postRouter = express.Router();

const POSTS_CACHE_KEY = "all_posts";
const CACHE_EXPIRATION_TIME = 10; // Cache for 1 hour (in seconds)
const USER_SAFE_DATA = "firstName lastName photoUrl email";

postRouter.get("/all", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    const cacheKeyWithPage = `${POSTS_CACHE_KEY}:${page}:${limit}`;
    const redisClient = req.redisClient; // Access the Redis client from the request object

    // 1. Check Redis for cached data
    const cachedPosts = await redisClient.get(cacheKeyWithPage);

    if (cachedPosts) {
      console.log("Serving posts from Redis cache");
      return res.json(JSON.parse(cachedPosts));
    }

    // 2. If not cached, fetch from MongoDB
    const posts = await Post.find({})
      .skip(skip)
      .limit(limit)
      .populate("author", USER_SAFE_DATA).
      sort({ createdAt: -1 });

    const totalPosts = await Post.countDocuments({});
    const responseData = {
      posts,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    };

    // 3. Cache the data in Redis
    await redisClient.SETEX(
      cacheKeyWithPage,
      CACHE_EXPIRATION_TIME,
      JSON.stringify(responseData)
    );
    console.log("Posts fetched from MongoDB and cached in Redis");
    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});


postRouter.get("/single/:id", userAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const cacheKey = `post:${postId}`;
    const redisClient = req.redisClient; // Access the Redis client from the request object

    // 1. Check Redis for cached data
    const cachedPost = await redisClient.get(cacheKey);

    if (cachedPost) {
      console.log("Serving post from Redis cache");
      return res.json(JSON.parse(cachedPost));
    }

    // 2. If not cached, fetch from MongoDB
    const post = await Post.findById(postId).populate("author", "username");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 3. Cache the data in Redis
    await redisClient.SETEX(cacheKey, CACHE_EXPIRATION_TIME, JSON.stringify(post));
    console.log("Post fetched from MongoDB and cached in Redis");
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch post" });
  }
}
);
postRouter.post("/create", userAuth, async (req, res) => {
  try {
    const { title, content,selectedTags } = req.body;
    const author = req.user._id;

    const newPost = new Post({ title, content,tags:selectedTags,author });
    await newPost.save();

    // Invalidate the cache for all posts
    const redisClient = req.redisClient; // Access the Redis client from the request object
    await redisClient.del(POSTS_CACHE_KEY);

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create post" });
  }
});
postRouter.put("/update/:id", userAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { title, content },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Invalidate the cache for all posts
    const redisClient = req.redisClient; // Access the Redis client from the request object
    await redisClient.del(POSTS_CACHE_KEY);

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update post" });
  }
});

postRouter.post("/like/:id", userAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id; // Assuming user ID is available in req.user

    const redisClient = req.redisClient; // Access the Redis client from the request object

    // 1. Add the user to the Redis set for likes
    const redisKey = `post:${postId}:likes`;
    const addedToRedis = await redisClient.sAdd(redisKey, userId.toString());

    if (addedToRedis === 0) {
      // User already liked the post
      return res.status(400).json({ message: "Post already liked" });
    }

    // 2. Optionally, persist the like in MongoDB (if needed for analytics or backup)
    const post = await Post.findById(postId);
    if (!post) {
      // Rollback Redis operation if post doesn't exist
      await redisClient.sRem(redisKey, userId.toString());
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment the like count in MongoDB
    post.likes = (post.likes || 0) + 1;
    await post.save();

    // 3. Return the updated like count
    const likeCount = await redisClient.sCard(redisKey); // Get the total likes from Redis
    res.json({ message: "Post liked successfully", likeCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to like post" });
  }
});

postRouter.delete("/delete/:id", userAuth, async (req, res) => {
  try {
    const postId = req.params.id;

    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    // Invalidate the cache for all posts
    const redisClient = req.redisClient; // Access the Redis client from the request object
    await redisClient.del(POSTS_CACHE_KEY);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {   
    console.error(error);
    res.status(500).json({ message: "Failed to delete post" });
  }
}
);

module.exports = postRouter;