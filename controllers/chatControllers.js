const Message = require("../models/message");
const { Op } = require("sequelize");
const uploadtoS3 = require("../controllers/S3");

exports.UploadToS3 = async (req, res) => {
  // console.log(req.body);
  try {
    const { data, filename } = req.body;
    const location = await uploadtoS3(data, filename);
    // const image = location.Location;
    res.status(200).json({
      status: "success",
      location,
    });
  } catch (err) {
    res.status(500).json({ success: "false", err });
  }
};

exports.postChat = async (req, res) => {
  try {
    // console.log(req.body);
    const user = req.user;
    const { file, message, groupId } = req.body;
    // console.log(req.user.name);
    if (message === "" && file === null) {
      return res
        .status(401)
        .json({ message: "invalid message", success: "false" });
    }
    const newMessage = await user.createMessage({
      file,
      message,
      groupId,
      from: req.user.name,
    });
    // console.log(newMessage);
    res.status(200).json({ success: true, message: newMessage });
    //   .json({ success: "true", name: user.name, message: newMessage.message });
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
