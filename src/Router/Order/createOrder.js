// import { Router } from "express";
// import crypto from "crypto";
// import { Payment, Order, OrderCourses, User } from "../../Modal/index.js";
// import CartItem from "../../Modal/Cart.modal.js";
// import { distributeCommission } from "../../../utils/commissionEngine.js";

// const createOrder = Router();

// createOrder.post("/verify", async (req, res) => {
//     try {
//         const {
//             payment_db_id,
//             razorpay_payment_id,
//             razorpay_order_id,
//             razorpay_signature
//         } = req.body;

//         // 1. Signature Verify karein (Security check)
//         const body = razorpay_order_id + "|" + razorpay_payment_id;
//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(body.toString())
//             .digest("hex");

//         if (expectedSignature !== razorpay_signature) {
//             return res.status(400).json({ success: false, message: "Invalid signature" });
//         }

//         // 2. Payment table update karein
//         const payment = await Payment.findByPk(payment_db_id);
//         if (!payment) return res.status(404).json({ error: "Payment record not found" });

//         await payment.update({
//             status: "SUCCESS",
//             payment_id: razorpay_payment_id // Asli payment ID save karein
//         });

//         // 3. Cart se data fetch karein
//         const cartItems = await CartItem.findAll({ where: { userId: payment.userId } });
//         if (cartItems.length === 0) {
//             return res.status(400).json({ message: "Cart is empty" });
//         }
//         const courseIds = cartItems.map(item => item.course_id);

//         // 4. Final Order create karein
//         const order = await Order.create({
//             userId: payment.userId,
//             paymentId: payment.id,
//             totalAmount: payment.total_amount,
//             quantity: courseIds.length,
//             status: "completed",
//         });
//         const buyerUser = await User.findOne({ where: { userId: payment.userId } });

//         if (buyerUser) {
//             await distributeCommission(
//                 order.orderId,
//                 buyerUser.id,
//                 payment.total_amount
//             );
//         }

//         // 5. Junction Table link karein (Many-to-Many)
//         await order.addCourses(courseIds);

//         // 6. Payment ko Order ID se link karein
//         await payment.update({ order_id: String(order.orderId) });

//         // 7. 🔥 CART KHALI KAREIN
//         await CartItem.destroy({ where: { userId: payment.userId } });

//         res.json({ success: true, message: "Order placed successfully", order });

//     } catch (e) {
//         console.error("Verification Error:", e);
//         res.status(500).json({ error: e.message });
//     }
// });

// export default createOrder;
import { Router } from "express";
import Order from "../../Modal/order.js";
import User from "../../Modal/User.modal.js";
import Courses from "../../Modal/courses.modal.js";
import Payment from "../../Modal/Payment.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const createOrder = Router();

createOrder.post("/", authenticateToken, async (req, res) => {
    try {
        const { payment_db_id } = req.body;
        const userId = req.user.userId;

        const payment = await Payment.findOne({ where: { id: payment_db_id, userId } });

        if (!payment) {
            return res.status(404).json({ error: "Payment record not found" });
        }

        if (payment.status !== 'SUCCESS') {
            return res.status(400).json({ error: "Order cannot be created. Payment status is not SUCCESS." });
        }

        let order = await Order.findOne({ where: { payment_id: payment_db_id } });

        if (!order) {
            order = await Order.create({
                userId,
                totalAmount: payment.total_amount,
                quantity: payment.courseIds ? payment.courseIds.length : 1,
                status: 'completed',
                payment_id: payment_db_id
            });
        }

        const finalOrderData = await Order.findOne({
            where: { orderId: order.orderId },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["name", "email", "userId"]
                },
                {
                    model: Payment,
                    as: "payment"
                },
                {
                    model: Courses,
                    as: "ordered_courses",
                    through: { attributes: [] } // Junction table ke attributes hide karne ke liye
                },
            ],
        });

        res.status(200).json({
            success: true,
            message: "Order details fetched successfully",
            order: finalOrderData
        });

    } catch (error) {
        console.error("❌ Final Order Error:", error);
        res.status(500).json({ error: "Internal server error while fetching order details." });
    }
});

export default createOrder;