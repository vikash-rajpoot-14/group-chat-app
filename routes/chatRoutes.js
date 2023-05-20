const express = require('express')
const router = express.Router()

const userAuthorization = require("../middleware/authenticate")
const chatControllers = require("../controllers/chatControllers")

router.post("/sendmessage", userAuthorization.authenticate, chatControllers.postChat)
router.get("/fetchchat/:lastId", userAuthorization.authenticate, chatControllers.fetchChat)

module.exports = router