import { DataTypes } from "sequelize";
import sequelize from "../DB/sequelize.js";


const OrderCourses = sequelize.define("order_courses", {
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: false,
    tableName: "order_courses",
});

export default OrderCourses;
