const express = require("express");
const app = express();
const { adminAuth, userAuth } = require("./middlewares/auth");
require("dotenv").config();
const connectDB = require("./config/database");
const User = require("./models/user");

app.use(express.json());

app.post("/signup", async (req, res) => {
  const user = new User(req.body);
  try {
    if (req.body.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    if (req.body.age < 18) {
      throw new Error("Age cannot be less than 18");
    }
    if (req.body.photoUrl) {
      const url = req.body.photoUrl;
      const urlRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/;
      if (!urlRegex.test(url)) {
        throw new Error("Invalid URL");
      }
    }
    if (req.body.email) {
      const email = req.body.email;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email");
      }
    }
    await user.save();
    res.send("Users succesfully created");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//Get user by email
app.get("/user", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    AllowedUpdates = ["age", "gender", "photoUrl", "skills", "bio"];
    const isUpdateAllowed = Object.keys(data).every((update) =>
      AllowedUpdates.includes(update)
    );
    if (!isUpdateAllowed) {
      throw new Error("Invalid updates");
    }
    if (data?.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    if (data?.age < 18) {
      throw new Error("Age cannot be less than 18");
    }
    if (data.photoUrl) {
      const url = data.photoUrl;
      const urlRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/;
      if (!urlRegex.test(url)) {
        throw new Error("Invalid URL");
      }
    }

    await User.findByIdAndUpdate(userId, data, { runValidators: true });
    res.send("User updated succesfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    await User.findByIdAndDelete(userId);
    res.send("User deleted succesfully");
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

connectDB()
  .then(() => {
    console.log("Database connected");
    app.listen(3000, () => {
      console.log("Server is started on port 3000");
    });
  })
  .catch((error) => {
    console.error("Database connection failed");
  });
