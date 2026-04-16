// src/Modal/Wallet.modal.js
import sequelize from "../DB/sequelize.js";
import { DataTypes } from "sequelize";

const Wallet = sequelize.define("wallets", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    }
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "wallets",
    freezeTableName: true
});

export default Wallet;