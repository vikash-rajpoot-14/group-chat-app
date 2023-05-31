const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const signupControllers = require("../controllers/auth");

router.post("/signup", upload.single("pic"), signupControllers.signup);

router.post("/login", signupControllers.login);

// router.post('/user/getalluser')
module.exports = router;
