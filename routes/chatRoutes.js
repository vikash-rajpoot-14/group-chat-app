const express = require("express");
const router = express.Router();
const multer = require("multer");

const userauthorization = require("../middleware/authenticate");
const chatControllers = require("../controllers/chatControllers");

router.post(
  "/sendmessage",
  userauthorization.authenticate,
  chatControllers.postChat
);
router.get(
  "/fetchchat/:lastId",
  userauthorization.authenticate,
  chatControllers.fetchChat
);

module.exports = router;
