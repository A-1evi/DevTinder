const express = require("express");
const bcrypt = require("bcrypt");
const { validateEditProfileData } = require("../utils/validate");

const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  const user = req.user;
  try {
    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR:" + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res.json({
      message: `${loggedInUser.firstName}, your profile has been updated succesfully`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("ERROR :" + error.message);
  }
});

profileRouter.patch("/profile/changePassword", userAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
 
  const user = req.user;

  try {
    const isPasswordMatch = await user.matchPassword(currentPassword);
    if (!isPasswordMatch) {
      throw new Error("Invalid current password");
    } else {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      user.password = passwordHash;
      await user.save();
      res.send("Password changed succesfully");
    }
  } catch (error) {
    res.status(401).send("ERROR :" + error.message);
  }
});

module.exports = profileRouter;
