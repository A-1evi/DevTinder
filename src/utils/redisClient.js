const { createClient } = require("redis");

const client = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-16561.c264.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 16561,
  },
});

// Register the error listener immediately
client.on("error", (err) => console.log("Redis Client Error", err));

const connectRedis = async () => {
  try {
    await client.connect();
    console.log("Client is connected");

    return client; // Optionally return the client instance if needed
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    // Optionally, you might want to throw the error here to propagate it
    throw error;
  }
};

module.exports = connectRedis;
