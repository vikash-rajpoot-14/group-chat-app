const Message = require("../models/message");
const { Op } = require("sequelize");
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

exports.postChat = async (req, res) => {
  try {
    const user = req.user;
    const { message, groupId } = req.body;
    console.log(message, groupId);
    if (message === "" && req.file === undefined) {
      return res
        .status(500)
        .json({ message: "invalid message", success: "false" });
    }
    if (req.file !== undefined || message === "") {
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
      const imageurl = url.split("?")[0];
      const newMessage = await user.createMessage({
        file: imageurl,
        message,
        groupId,
        from: req.user.name,
      });
      res.status(200).json({ success: true, message: newMessage });
    } else {
      const newMessage = await user.createMessage({
        file: null,
        message,
        groupId,
        from: req.user.name,
      });
      res.status(200).json({ success: true, message: newMessage });
    }
  } catch (error) {
    res.status(500).json({ success: "false", error });
  }
};

exports.fetchChat = async (req, res) => {
  try {
    const lastChatId = +req.params.lastId;
    //console.log("this is last chat i backend", lastChatId)
    const chat = await Message.findAll({
      where: { id: { [Op.gt]: lastChatId } },
    });
    //console.log(chat, "this is chat")
    if (chat.length == 0) {
      return res.status(200).json({ message: "chat up to date", chat: [] });
    }
    res.status(200).json({
      message: "fetch success",
      chat,
      lastChatId: chat[chat.length - 1].id,
    });
  } catch (error) {
    res.status(500).json({ success: "false", message: "chat fetch error" });
  }
};
