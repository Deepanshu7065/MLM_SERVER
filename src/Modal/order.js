// import { DataTypes } from "sequelize";
// import sequelize from "../DB/sequelize.js";

// const Order = sequelize.define("orders", {
//     orderId: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     userId: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     paymentId: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//     },
//     totalAmount: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//     },
//     quantity: {
//         type: DataTypes.INTEGER,
//         defaultValue: 1
//     },
//     status: {
//         type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
//         defaultValue: 'pending'
//     },
// }, {
//     timestamps: true,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//     tableName: "orders",
// });

// export default Order;
// src/Modal/order.js
import sequelize from "../DB/sequelize.js";
import { DataTypes } from "sequelize";
import User from "./User.modal.js";
import Courses from "./courses.modal.js";
import Payment from "./Payment.modal.js";
import OrderCourses from "./OrderCourse.modal.js";

const Order = sequelize.define("orders", {
    orderId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        allowNull: false
    },
    payment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'payment_id'
    },
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "orders",
});


export default Order;