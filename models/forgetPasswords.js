const Sequelize = require("sequelize")
const sequelize = require("../util/database")
const Forgetpassword = sequelize.define("forgetpassword", {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
    },
    isActive: {
        type: Sequelize.BOOLEAN
    }

})

module.exports = Forgetpassword;