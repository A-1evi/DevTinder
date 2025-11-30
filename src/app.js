const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./utils/socket");
const chatRouter = require("./routes/chat");
const morgan = require("morgan");
const connectRedis = require("./utils/redisClient");
const postRouter = require("./routes/post");
const server = http.createServer(app);

// Configure CORS properly. Do NOT use `location` (browser global) on the server.
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://devtinder-web-zeta.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: This origin is not allowed."));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

async function initalizeRedis() {
  const redisClient = await connectRedis();

  app.use(
    "/post",
    (req, res, next) => {
      req.redisClient = redisClient;
      next();
    },
    postRouter
  );
}

initalizeRedis();

initializeSocket(server);
connectDB()
  .then(() => {
    console.log("Database connected");
    server.listen(process.env.PORT, () => {
      console.log(`Server is started on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed");
  });
