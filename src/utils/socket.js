const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");

const initializeSocket = (server) => {
  const secretRoomId = (userId, targetId) => {
    const secretRoomId = crypto
      .createHash("sha256")
      .update([userId, targetId].sort().join("-"))
      .digest("hex");
    return secretRoomId;
  };
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, lastName, targetId, userId }) => {
      const roomId = secretRoomId(userId, targetId);
      socket.join(roomId);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetId, message }) => {
        try {
          const roomId = secretRoomId(userId, targetId);
          

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetId] },
          });
          if (!chat) {
            chat = await Chat.create({
              participants: [userId, targetId],
              messages: [],
            });
          }
          chat.messages.push({ senderId: userId, message });
          await chat.save();
          io.to(roomId).emit("messageRecieved", {
            firstName,
            lastName,
            message,
            createdAt: new Date(),
          });
        } catch (error) {
          console.log(error);
        }
      }
    );
    socket.on("disconnect", () => {});
  });
};

module.exports = {
  initializeSocket,
};
