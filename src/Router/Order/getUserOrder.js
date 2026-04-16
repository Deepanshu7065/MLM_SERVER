import { Router } from "express";
import Order from "../../Modal/order.js";
import Payment from "../../Modal/Payment.modal.js";
import User from "../../Modal/User.modal.js";
import Courses from "../../Modal/courses.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const getUserOrder = Router();

// GET /api/order/my — Logged in user ke apne orders
getUserOrder.get("/", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.userId },
      include: [
        { model: Payment, as: "payment" },
        { model: User, as: "user", attributes: ["name", "email", "userId"] },
        { model: Courses, as: "ordered_courses", through: { attributes: [] } },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, count: orders.length, orders });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default getUserOrder;

// import { Router } from "express";
// import Order from "../../Modal/order.js";
// import Payment from "../../Modal/Payment.modal.js";
// import User from "../../Modal/User.modal.js";
// import Courses from "../../Modal/courses.modal.js";
// import { authenticateToken } from "../../../middleware/authentication.js";

// const getUserOrder = Router();

// getUserOrder.get("/", authenticateToken, async (req, res) => {
//     try {
//         const orders = await Order.findAll({
//             where: { userId: req.user.userId },
//             include: [
//                 { 
//                     model: Payment, 
//                     as: "payment" // Index.js wala alias
//                 },
//                 { 
//                     model: User, 
//                     as: "user",   // Index.js wala alias
//                     attributes: ['name', 'email', 'userId'] 
//                 },
//                 {
//                     model: Courses,
//                     as: "ordered_courses",
//                     through: { attributes: [] },
//                 }
//             ],
//             order: [['created_at', 'DESC']]
//         });

//         res.json({ success: true, count: orders.length, orders });
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ error: e.message });
//     }
// });

// export default getUserOrder;