const validator = require("validator");

const validateSignUpData = (req) => {
  const { emailId, password, firstName, lastName } = req.body;
  if (!emailId || !password || !firstName || !lastName) {
    throw new Error("Missing required fields");
  } else if (!validator.isEmail(emailId)) {
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
    "title",
    "languages",
    "frameworks",
    "githubUrl",
    "linkedinUrl",
    "portfolio",
  ];

  // Check if all provided fields are allowed
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedInputField.includes(field)
  );

  if (!isEditAllowed) {
    throw new Error("Invalid fields provided");
  }

  // Validate URLs if they are provided
  if (req.body.githubUrl && !validator.isURL(req.body.githubUrl)) {
    throw new Error("Invalid GitHub URL");
  }
  if (req.body.linkedinUrl && !validator.isURL(req.body.linkedinUrl)) {
    throw new Error("Invalid LinkedIn URL");
  }
  if (req.body.portfolio && !validator.isURL(req.body.portfolio)) {
    throw new Error("Invalid Portfolio URL");
  }

  // Validate age if provided
  if (
    req.body.age &&
    (!Number.isInteger(Number(req.body.age)) || Number(req.body.age) < 18)
  ) {
    throw new Error("Age must be a valid number and at least 18");
  }

  return true;
};

module.exports = { validateSignUpData, validateEditProfileData };
