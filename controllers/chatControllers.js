const Message = require("../models/message")
const { Op } = require("sequelize")

exports.postChat = async (req, res) => {
    try {
        const user = req.user
        const { message, groupId } = req.body
        if (message === "") {
            return res.status(401).json({ message: "invalid message", success: "false" })
        }
        const newMessage = await user.createMessage({ message: message, groupId: groupId, from: req.user.name })
        res.status(200).json({ success: "true", name: user.name, message: newMessage.message })
    } catch (error) {
        res.status(500).json({ success: "false", error })
    }
}

exports.fetchChat = async (req, res) => {
    try {
        const lastChatId = +req.params.lastId
        //console.log("this is last chat i backend", lastChatId)
        const chat = await Message.findAll({ where: { id: { [Op.gt]: lastChatId } } })
        //console.log(chat, "this is chat")
        if (chat.length == 0) {
            return res.status(200).json({ message: "chat up to date", chat: [] })
        }
        res.status(200).json({ message: "fetch success", chat, lastChatId: chat[chat.length - 1].id })
    } catch (error) {
        res.status(500).json({ success: "false", message: "chat fetch error" })
    }
}
