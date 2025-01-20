const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    lastName: {
      type: String,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password");
        }
      },
    },
    bio: {
      type: String,
      maxlength: 400,
      default: "No bio added yet",
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender data is not valid");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://img.freepik.com/free-psd/3d-icon-social-media-app_23-2150049569.jpg?t=st=1736435336~exp=1736438936~hmac=d5769f21a962d71394dff414582f32966044ca7512585c49e21a2b190b85e45c&w=740",
    },
    skills: {
      type: [String], 
    },
  },
  { timestamps: true }
);
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "devTinder@321", {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.matchPassword = async function (userInputPassword) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordMatch = await bcrypt.compare(userInputPassword, passwordHash);

  return isPasswordMatch;
};

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
