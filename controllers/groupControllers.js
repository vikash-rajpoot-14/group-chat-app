const Group = require("../models/group");
const User = require("../models/user");
const GroupUser = require("../models/groupUser");

exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const user = req.user;
    if (name.length > 0 && typeof name === "string") {
      const group = await user.createGroup(
        { name, description },
        { through: { isAdmin: true } }
      );
      res
        .status(200)
        .json({ message: "create group success", group, success: "true" });
    }
  } catch (error) {
    res.status(500).json({ error, success: "false" });
  }
};

exports.getAllGroups = async (req, res) => {
  try {
    const user = req.user;
    const groups = await user.getGroups();
    if (!groups || groups.length === 0) {
      return res
        .status(201)
        .json({ message: "No Groups Present", success: "true" });
    }
    res.status(200).json({
      message: "fetch success",
      groups,
      success: "true",
      username: user.name,
    });
  } catch (error) {
    res.status(500).json({ error, success: "false" });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    // console.log(userId, typeof userId);
    // console.log(groupId, "this is group id")
    const group = await Group.findByPk(groupId);
    const groupUser = await GroupUser.findAll({ where: { groupId: groupId } });
    // console.log(group.id, groupUser)
    groupUser.forEach(async (user) => {
      // console.log(user.dataValues.userId, user.dataValues.isAdmin)
      if (
        user.dataValues.userId === userId &&
        user.dataValues.isAdmin === true
      ) {
        // console.log("inside true condition")

        const deleteResponse = await Group.destroy({ where: { id: group.id } });
        res.status(200).json({
          message: "delete group success ",
          success: "true",
          deleteResponse,
        });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Delete group Failed !! ", success: "false" });
  }
};
