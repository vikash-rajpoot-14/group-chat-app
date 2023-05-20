const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const GroupUser = sequelize.define("groupuser", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        default: false,
    },
});

module.exports = GroupUser;
