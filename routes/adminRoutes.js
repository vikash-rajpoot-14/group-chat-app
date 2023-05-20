const express = require("express")
const router = express.Router()

const userAuthorization = require("../middleware/authenticate")
const adminControllers = require("../controllers/adminControllers")

router.post("/admin/addMember", userAuthorization.authenticate, adminControllers.addMember)
router.get("/admin/getAllMembers/:groupId", userAuthorization.authenticate, adminControllers.getAllMembers)
router.post("/admin/makeAdmin", userAuthorization.authenticate, adminControllers.makeAdmin)
router.post("/admin/removeAdmin", userAuthorization.authenticate, adminControllers.removeAdmin)
router.post("/admin/removeUser", userAuthorization.authenticate, adminControllers.removeUser)

module.exports = router