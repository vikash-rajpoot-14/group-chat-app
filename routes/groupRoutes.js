const express = require("express");
const router = express.Router();

const userauthorization = require("../middleware/authenticate");
const groupControllers = require("../controllers/groupControllers");

router.post(
  "/addgroup",
  userauthorization.authenticate,
  groupControllers.createGroup
);
router.get(
  "/getAllGroups",
  userauthorization.authenticate,
  groupControllers.getAllGroups
);
router.delete(
  "/deletegroup/:id",
  userauthorization.authenticate,
  groupControllers.deleteGroup
);

module.exports = router;
