import { Router } from "express";
import Order from "../../Modal/order.js";
import Payment from "../../Modal/Payment.modal.js";
import User from "../../Modal/User.modal.js";
import Courses from "../../Modal/courses.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const getOrderForInvoice = Router();

// GET /invoice-order/:orderId
// Print ke liye single order ki poori details
getOrderForInvoice.get("/:orderId", authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            where: { orderId },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["name", "email", "phone"],
                },
                {
                    model: Payment,
                    as: "payment",
                    attributes: ["total_amount", "status", "created_at"],
                },
                {
                    model: Courses,
                    as: "ordered_courses",
                    through: { attributes: [] },
                    attributes: ["id", "course_name", "price"],
                },
            ],
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Sirf apna order dekh sake — admin ko bypass
        const isAdmin = req.user.role === "admin";
        if (!isAdmin && order.userId !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const totalAmount = Number(order.totalAmount ?? 0);
        const GST_RATE = 0.18;
        const baseAmount = Math.round(totalAmount / (1 + GST_RATE));
        const gstAmount = totalAmount - baseAmount;

        res.json({
            success: true,
            data: {
                orderId: order.orderId,
                created_at: order.created_at ?? order.createdAt,
                status: order.payment?.status ?? "paid",
                user: {
                    name: order.user?.name ?? "",
                    email: order.user?.email ?? "",
                    phone: order.user?.phone ?? "",
                },
                ordered_courses: (order.ordered_courses ?? []).map((c) => ({
                    id: c.id,
                    course_name: c.course_name,
                    price: Number(c.price),
                })),
                subtotal: baseAmount,      // GST-exclusive
                gstAmount: gstAmount,      // sirf GST
                totalAmount: totalAmount,  // final paid (GST included)
            },
        });
    } catch (error) {
        console.error("❌ Invoice Order Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

export default getOrderForInvoice;