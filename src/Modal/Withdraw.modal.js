// src/Modal/Withdrawal.modal.js
import sequelize from "../DB/sequelize.js";
import { DataTypes } from "sequelize";

const Withdrawal = sequelize.define("withdrawals", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("PENDING", "SUCCESS", "REJECTED"),
        defaultValue: "PENDING",
    },
    transactionId: {
        type: DataTypes.STRING, // Admin jab payment karega tab fill karega
        allowNull: true,
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "withdrawals",
});

export default Withdrawal;