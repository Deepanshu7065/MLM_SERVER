import { Router } from "express";
import Order from "../../Modal/order.js";
import User from "../../Modal/User.modal.js";
import Payment from "../../Modal/Payment.modal.js";
import Courses from "../../Modal/courses.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import { allowRoles } from "../../../middleware/roleMiddleware.js";

const getOrder = Router();

// GET /api/order/ — Admin only
getOrder.get("/", authenticateToken, allowRoles("admin"), async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: User, as: "user", attributes: ["name", "email", "userId"] },
                { model: Payment, as: "payment" },
                { model: Courses, as: "ordered_courses", through: { attributes: [] } },
            ],
            order: [["created_at", "DESC"]],
        });

        res.status(200).json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default getOrder;



// import { Router } from "express";
// import Order from "../../Modal/order.js";
// import User from "../../Modal/User.modal.js";
// import Payment from "../../Modal/Payment.modal.js";
// import Courses from "../../Modal/courses.modal.js";
// import { authenticateToken } from "../../../middleware/authentication.js";
// import { allowRoles } from "../../../middleware/roleMiddleware.js";

// const getOrder = Router();

// getOrder.get("/", authenticateToken, allowRoles("admin"), async (req, res) => {
//     try {
//         const orders = await Order.findAll({
//             include: [
//                 { model: User, as: 'user', attributes: ['name', 'email'] },
//                 { model: Payment, as: 'payment' }, // Check karein 'payment' singular hai
//                 {
//                     model: Courses,
//                     as: "ordered_courses",
//                     through: { attributes: [] }
//                 }
//             ]
//         });

//         res.status(200).json({ success: true, orders });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// export default getOrder;