const User = require("../models/user");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const UploadToS3 = require("./S3");

function validate(inputString) {
  if (inputString == undefined || inputString.length === 0) {
    return false;
  } else {
    return true;
  }
}
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    // console.log("pic", pic);

    if (
      !validate(name) ||
      !validate(email) ||
      !validate(phone) ||
      !validate(password)
    ) {
      res.status(401).json({ message: "Bad Parameters", success: "false" });
    }
    const saltrounds = 10;
    const existingUser = await User.findOne({
      where: {
        [Op.and]: [{ email: email }, { phone: phone }],
      },
    });
    // const ur = UploadToS3();
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exist" });
    }
    bcrypt.hash(password, saltrounds, async (err, hash) => {
      if (err) {
        res.status(400).json({ err: err });
      }
      await User.create({ name, email, phone, password: hash });
      res.status(200).json({ message: "User created", status: "success" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
function generateWebToken(id, name) {
  return jwt.sign({ userId: id, name }, "secretkey");
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validate(email) || !validate(password)) {
      return res
        .status(400)
        .json({ message: "Bad Parameters", success: "false" });
    }
    const user = await User.findOne({ where: { email: email } });
    //console.log(user)
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result === true) {
          res.status(200).json({
            message: "Login Success",
            success: "true",
            token: generateWebToken(user.id, user.name),
            username: user.name,
          });
        } else {
          res
            .status(401)
            .json({ message: "Password is Incorrect", success: "false" });
        }
      });
    } else {
      res.status(404).json({ message: "user not found", success: "false" });
    }
  } catch (error) {
    res.status(500).json({ error: error, message: "login failed" });
  }
};
