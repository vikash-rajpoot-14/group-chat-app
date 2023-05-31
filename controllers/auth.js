const User = require("../models/user");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

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
    // console.log(req.body);
    // console.log(req.file);
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
    if (req.file !== undefined) {
      const params = {
        Bucket: bucketName,
        Body: req.file.buffer,
        Key: req.file.originalname,
        ContentType: req.file.mimetype,
      };
      const command = new PutObjectCommand(params);
      await s3.send(command);
      const getparams = {
        Bucket: bucketName,
        Key: req.file.originalname,
      };
      const getcommand = new GetObjectCommand(getparams);

      const url = await getSignedUrl(s3, getcommand, { expiresIn: 3600 });
      const pic = url.split("?")[0];
      bcrypt.hash(password, saltrounds, async (err, hash) => {
        if (err) {
          res.status(400).json({ err: err });
        }
        await User.create({
          name,
          email,
          phone,
          password: hash,
          pic,
        });
        res.status(200).json({ message: "User created", status: "success" });
      });
    } else {
      bcrypt.hash(password, saltrounds, async (err, hash) => {
        if (err) {
          res.status(400).json({ err: err });
        }
        await User.create({
          name,
          email,
          phone,
          password: hash,
        });
        res.status(200).json({ message: "User created", status: "success" });
      });
    }
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
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result === true) {
          res.status(200).json({
            message: "Login Success",
            success: "true",
            token: generateWebToken(user.id, user.name),
            username: user.name,
            userpic: user.pic,
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
