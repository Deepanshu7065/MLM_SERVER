import { DataTypes } from "sequelize";
import sequelize from "../DB/sequelize.js";
import User from "./User.modal.js";

const Contact = sequelize.define("contacts", {
    ticket_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("open", "closed"),
        defaultValue: "open"
    }
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "tickets", 
});

User.hasMany(Contact, { foreignKey: "userId", sourceKey: "userId" });
Contact.belongsTo(User, { foreignKey: "userId", targetKey: "userId" });

export default Contact;