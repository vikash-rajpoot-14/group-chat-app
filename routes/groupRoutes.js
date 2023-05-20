const express = require('express')
const router = express.Router()

const userAuthorization = require("../middleware/authenticate")
const groupControllers = require("../controllers/groupControllers")

router.post("/addgroup", userAuthorization.authenticate, groupControllers.createGroup)
router.get("/getAllGroups", userAuthorization.authenticate, groupControllers.getAllGroups)
router.delete("/deletegroup/:id", userAuthorization.authenticate, groupControllers.deleteGroup)


module.exports = router;