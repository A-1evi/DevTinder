// routes/posts.js
const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Post = require("../models/post");
const postRouter = express.Router();

const POSTS_CACHE_KEY = "all_posts";
const CACHE_EXPIRATION_TIME = 3600; // Cache for 1 hour (in seconds)

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
      .populate("author", "username")
      .sort({ createdAt: -1 });

    const totalPosts = await Post.countDocuments({});
    const responseData = {
      posts,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    };

    // 3. Cache the data in Redis
    await redisClient.setex(
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

module.exports = postRouter;