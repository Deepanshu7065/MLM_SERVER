import sequelize from "../DB/sequelize.js";
import { DataTypes } from "sequelize";
import User from "./User.modal.js";

const Wallet = sequelize.define("wallets", {
    id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId:  { type: DataTypes.STRING, allowNull: false, unique: true },
    balance: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 }
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "wallets",
    freezeTableName: true
});

// ← ADD THIS
Wallet.belongsTo(User, { foreignKey: "userId", targetKey: "userId", as: "user" });
User.hasOne(Wallet,    { foreignKey: "userId", sourceKey: "userId", as: "wallet" });

export default Wallet;