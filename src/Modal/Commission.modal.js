// src/Modal/Commission.modal.js
import sequelize from "../DB/sequelize.js";
import { DataTypes } from "sequelize";

const Commission = sequelize.define("commissions", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING,   // VARCHAR — Users.userId se match karega
        allowNull: false,
    },
    buyerUserId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM("level1", "level2"),
        allowNull: false,
    }
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "commissions",
    freezeTableName: true
});

export default Commission;