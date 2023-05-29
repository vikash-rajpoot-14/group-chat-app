const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userauthorization = require("../middleware/authenticate");
const chatControllers = require("../controllers/chatControllers");

router.post(
  "/sendmessage",
  userauthorization.authenticate,
  upload.single("image"),
  chatControllers.postChat
);

router.get(
  "/fetchchat/:lastId",
  userauthorization.authenticate,
  chatControllers.fetchChat
);

module.exports = router;
