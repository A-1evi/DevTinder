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
const server = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
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
