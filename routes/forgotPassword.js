const express = require("express")
const router = express.Router()
const forgetPasswordControllers = require("../controllers/forgetPasswordControllers")



router.use("/password/forgotpassword", forgetPasswordControllers.forgetPassword)

router.get("/password/resetpassword/:id", forgetPasswordControllers.resetPassword)

router.get("/password/updatepassword/:resetpasswordid", forgetPasswordControllers.updatePassword)

module.exports = router