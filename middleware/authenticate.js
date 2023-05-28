const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.authenticate = (req, res, next) => {
  try {
    const token = req.header("authorization");
    const user = jwt.verify(token, "secretkey");
    User.findByPk(user.userId)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => console.log(err));
  } catch (error) {
    res
      .status(500)
      .json({ error, success: "false", message: "authentication failed" });
  }
};
