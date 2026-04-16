import { DataTypes } from "sequelize";
import sequelize from "../DB/sequelize.js";
import Contact from "./Contact.modal.js";
import User from "./User.modal.js";

const TicketMessage = sequelize.define("ticket_messages", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ticket_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    senderId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: "created_at",
    tableName: "ticket_messages",
});

Contact.hasMany(TicketMessage, { foreignKey: "ticket_id" });
TicketMessage.belongsTo(Contact, { foreignKey: "ticket_id" });
TicketMessage.belongsTo(User, { foreignKey: "senderId", targetKey: "userId", as: 'sender' });

export default TicketMessage;