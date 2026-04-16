// src/Modal/index.js
import CartItem from "./Cart.modal.js";
import Courses from "./courses.modal.js";
import Order from "./order.js";
import OrderCourses from "./OrderCourse.modal.js";
import Payment from "./Payment.modal.js";
import User from "./User.modal.js";
import Wallet from "./Wallet.modal.js";
import Commission from "./Commission.modal.js";

// ---- Existing associations (unchanged) ----
User.hasMany(Order, { foreignKey: "userId", sourceKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId", targetKey: "userId", as: "user" });

User.hasMany(CartItem, { foreignKey: "userId", sourceKey: "userId" });
CartItem.belongsTo(User, { foreignKey: "userId", targetKey: "userId" });

Payment.hasOne(Order, { foreignKey: "payment_id" });
Order.belongsTo(Payment, { foreignKey: "payment_id", as: "payment" });

Order.belongsToMany(Courses, {
    through: OrderCourses,
    foreignKey: "orderId",
    otherKey: "courseId",
    as: "ordered_courses",
});
Courses.belongsToMany(Order, {
    through: OrderCourses,
    foreignKey: "courseId",
    otherKey: "orderId",
});

User.hasMany(Payment, { foreignKey: "userId", sourceKey: "userId" });
Payment.belongsTo(User, { foreignKey: "userId", targetKey: "userId" });

Courses.hasMany(CartItem, { foreignKey: "course_id" });
CartItem.belongsTo(Courses, { foreignKey: "course_id", as: "courses" });

// ---- NEW: Wallet (constraints: false — DB-level FK nahi banega) ----
User.hasOne(Wallet, {
    foreignKey: "userId",
    sourceKey: "userId",
    constraints: false       // ✅ Yahi fix hai
});
Wallet.belongsTo(User, {
    foreignKey: "userId",
    targetKey: "userId",
    constraints: false       // ✅ Yahi fix hai
});

// ---- NEW: Commission (constraints: false) ----
User.hasMany(Commission, {
    foreignKey: "userId",
    sourceKey: "userId",
    as: "commissionsReceived",
    constraints: false       // ✅ Yahi fix hai
});
Commission.belongsTo(User, {
    foreignKey: "userId",
    targetKey: "userId",
    as: "recipient",
    constraints: false       // ✅ Yahi fix hai
});

User.hasMany(Commission, {
    foreignKey: "buyerUserId",
    sourceKey: "userId",
    as: "commissionsPaid",
    constraints: false       // ✅ Yahi fix hai
});
Commission.belongsTo(User, {
    foreignKey: "buyerUserId",
    targetKey: "userId",
    as: "buyer",
    constraints: false       // ✅ Yahi fix hai
});

Order.hasMany(Commission, {
    foreignKey: "orderId",
    sourceKey: "orderId",
    constraints: false       // ✅ Yahi fix hai
});
Commission.belongsTo(Order, {
    foreignKey: "orderId",
    targetKey: "orderId",
    constraints: false       // ✅ Yahi fix hai
});

export { User, Courses, Payment, Order, OrderCourses, CartItem, Wallet, Commission };