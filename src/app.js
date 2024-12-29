const express = require("express");
const app = express();

app.get(
  "/user",
  (req, res, next) => {
    console.log("Route handler 1 is called");
    res.send("response");
    next();
  },
  (req, res) => {
    console.log("Route handler 2 is called");
    res.send(" 2nd response");
  }
);

app.listen(3000, () => {
  console.log("Server is started on port 3000");
});
