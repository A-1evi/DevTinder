const validator = require("validator");

const validateSignUpData = (req) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    throw new Error("Missing required fields");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};
const validateEditProfileData = (req) => {
  const allowedInputField = [
    "firstName",
    "lastName",
    "photoUrl",
    "age",
    "gender",
    "skills",
    "bio",
  ];
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedInputField.includes(field)
  );
  return isEditAllowed;
};

module.exports = { validateSignUpData, validateEditProfileData };
