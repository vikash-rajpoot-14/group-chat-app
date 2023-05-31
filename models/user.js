const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
  },
  phone: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  },
  pic: {
    type: Sequelize.STRING,
    defaultValue:
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
});

module.exports = User;
