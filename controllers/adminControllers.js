const User = require("../models/user")
const Group = require("../models/group")
const GroupUser = require("../models/groupUser")
const { Op } = require("sequelize");

exports.addMember = async (req, res) => {
    try {
        const email = req.body.email
        const groupId = req.body.groupId
        console.log(groupId, typeof groupId, email)
        const user = await User.findOne({ where: { email: email } })
        console.log(user.id, "addmember user")
        if (!user) {
            return res.status(404).json({ message: "email not registered", success: "false" })
        }
        const group = await Group.findOne({ where: { id: groupId } })
        console.log(group)

        const membercreate = await group.addUser(user, { through: { isAdmin: false } })
        console.log(membercreate)
        res.status(200).json({ message: "added new user to group ", success: "true" })

    } catch (error) {
        res.status(500).json({ message: "Ahh Snap !! Something went wrong. " })
    }
}
exports.removeUser = async (req, res) => {
    try {
        const delUserId = req.body.userId;
        const groupId = req.body.groupId;

        const user = await User.findByPk(delUserId);

        if (!user) {
            return res.status(403).json({ message: "User Not Found" });
        }
        const verifiedAdmin = await GroupUser.findOne({
            where: {
                [Op.and]: [
                    { userId: req.user.id },
                    { isAdmin: true },
                    { groupId: groupId },
                ],
            },
        });
        if (!verifiedAdmin) {
            return res.status(403).json({ message: "you dont have permissions" });
        } else {
            const memberToBeRemoved = await GroupUser.findOne({
                where: { [Op.and]: [{ userId: delUserId }, { groupId: groupId }] },
            });
            await memberToBeRemoved.destroy();
            res.status(200).json({ message: "user removed from group" });
        }
    } catch (error) {
        res.status(500).json({ message: "remove member failed ", success: "false" })
    }
}
exports.getAllMembers = async (req, res) => {
    try {
        const groupId = +req.params.groupId;
        const members = await GroupUser.findAll({ where: { groupId } });
        // console.log(members);
        const membersToSend = [];
        for (let i = 0; i < members.length; i++) {
            const user = await User.findByPk(members[i].userId);

            if (user) {
                // let newPart = {};
                const userToSend = {
                    ...user,
                    isAdmin: members[i].isAdmin,
                };
                membersToSend.push(userToSend);
            }
        }
        res.status(200).json({ members: membersToSend, success: "true" });
    } catch (error) {
        res.status(500).json({ message: "fetch member failed ", success: "false" })
    }
}
exports.makeAdmin = async (req, res) => {
    try {
        let groupId = req.body.groupId;
        let userIdToBeAdmin = req.body.userId;
        let user = await User.findByPk(userIdToBeAdmin);

        if (!user) {
            return res.status(403).json({ message: "User Not Found" });
        }

        const verifiedAdmin = await GroupUser.findOne({
            where: {
                [Op.and]: [
                    { userId: req.user.id },
                    { isAdmin: true },
                    { groupId: groupId },
                ],
            },
        });
        if (!verifiedAdmin) {
            return res.status(403).json({ message: "you dont have permissions" });
        }
        let memberToBeUpdated = await GroupUser.findOne({
            where: {
                [Op.and]: [{ userId: userIdToBeAdmin }, { groupId: groupId }],
            },
        });
        await memberToBeUpdated.update({ isAdmin: true });
        res.status(200).json({ message: "user set as admin" });
    } catch (error) {
        res.status(500).json({ message: "fetch member failed ", success: "false" })
    }
}

exports.removeAdmin = async (req, res) => {
    try {
        let userToBeRemoveAsAdmin = req.body.userId;
        let groupId = req.body.groupId;

        let user = await User.findByPk(userToBeRemoveAsAdmin);
        if (!user) {
            res.status(403).json({ message: "User Not Found" });
        }
        const verifiedAdmin = await GroupUser.findOne({
            where: {
                [Op.and]: [
                    { userId: req.user.id },
                    { isAdmin: true },
                    { groupId: groupId },
                ],
            },
        });
        if (!verifiedAdmin) {
            return res.status(403).json({ message: "you dont have permissions" });
        }
        let memberToBeUpdated = await GroupUser.findOne({
            where: {
                [Op.and]: [{ userId: userToBeRemoveAsAdmin }, { groupId: groupId }],
            },
        });
        await memberToBeUpdated.update({ isAdmin: false });
        res.status(200).json({ message: "User removed As Admin" });
    } catch (error) {
        res.status(500).json({ message: "remove admin failed", success: "false" })

    }
}