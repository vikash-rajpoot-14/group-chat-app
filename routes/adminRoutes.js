const express = require("express");
const router = express.Router();

const userauthorization = require("../middleware/authenticate");
const adminControllers = require("../controllers/adminControllers");

router.post(
  "/admin/addMember",
  userauthorization.authenticate,
  adminControllers.addMember
);
router.get(
  "/admin/getAllMembers/:groupId",
  userauthorization.authenticate,
  adminControllers.getAllMembers
);

router.post(
  "/admin/getAllUsers",
  userauthorization.authenticate,
  adminControllers.getAllUsers
);

router.post(
  "/admin/makeAdmin",
  userauthorization.authenticate,
  adminControllers.makeAdmin
);
router.post(
  "/admin/removeAdmin",
  userauthorization.authenticate,
  adminControllers.removeAdmin
);
router.post(
  "/admin/removeUser",
  userauthorization.authenticate,
  adminControllers.removeUser
);

module.exports = router;
