const adminAuth = (req, res, next) => {
  const token = "xyx";
  const isAuthorized = token === "xyx";
  if (!isAuthorized) {
    res.status(401).send("Unauthorized");
  } else {
    next();
  }
};

const userAuth = (req, res, next) => {
  const token = "abc";
  const isAuthorized = token === "abc";
  if (!isAuthorized) {
    res.status(401).send("Unauthorized");
  } else {
    next();
  }
};
module.exports = {adminAuth,userAuth};