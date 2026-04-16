// import { Router } from "express";
// import { Payment, Order, Courses } from "../../Modal/index.js";
// import crypto from "crypto";
// import CartItem from "../../Modal/Cart.modal.js";

// const changePaymentStatus = Router();

// changePaymentStatus.patch("/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         const {
//             status,
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature
//         } = req.body;

//         const payment = await Payment.findOne({ where: { id } });
//         if (!payment) return res.status(404).json({ error: "Payment not found" });

//         // 1. Signature Verification (Security Check)
//         if (status === 'SUCCESS') {
//             const body = razorpay_order_id + "|" + razorpay_payment_id;
//             const expectedSignature = crypto
//                 .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//                 .update(body.toString())
//                 .digest("hex");

//             if (expectedSignature !== razorpay_signature) {
//                 return res.status(400).json({ success: false, message: "Invalid Signature" });
//             }

//             // 2. Status update karein aur Razorpay ID save karein
//             await payment.update({
//                 status: "SUCCESS",
//                 payment_id: razorpay_payment_id // Database reference ke liye
//             });

//             // 3. Check for existing order (Duplicate protection)
//             let existingOrder = await Order.findOne({ where: { paymentId: payment.id } });

//             if (!existingOrder) {
//                 // 4. Cart se data fetch karein
//                 const cartItems = await CartItem.findAll({ where: { userId: payment.userId } });

//                 if (cartItems.length > 0) {
//                     const courseIds = cartItems.map(item => item.course_id);

//                     // 5. Order Create karein
//                     const order = await Order.create({
//                         userId: payment.userId,
//                         paymentId: payment.id,
//                         totalAmount: payment.total_amount,
//                         quantity: courseIds.length,
//                         status: 'completed',
//                     });

//                     // 6. Junction Table mein entry (Courses link karein)
//                     await order.addCourses(courseIds);

//                     // 7. Payment table mein order_id link karein
//                     await payment.update({ order_id: String(order.orderId) });

//                     // 8. 🔥 Cart Empty karein
//                     await CartItem.destroy({ where: { userId: payment.userId } });

//                     return res.status(200).json({
//                         success: true,
//                         message: "Payment Verified, Order Created & Cart Cleared",
//                         order
//                     });
//                 }
//             }
//         } else {
//             // Agar payment fail hui ho
//             await payment.update({ status: "FAILED" });
//         }

//         res.status(200).json({ success: true, message: "Status updated successfully" });

//     } catch (error) {
//         console.error("❌ Error:", error);
//         res.status(500).json({ error: error.message });
//     }
// });

// export default changePaymentStatus;
import { Router } from "express";
import Payment from "../../Modal/Payment.modal.js";
import Order from "../../Modal/order.js";
import OrderCourses from "../../Modal/OrderCourse.modal.js";
import User from "../../Modal/User.modal.js";
import Courses from "../../Modal/courses.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import { allowRoles } from "../../../middleware/roleMiddleware.js";
import { processCommission } from "../../service/commissionServices.js";

const changePaymentStatus = Router();

changePaymentStatus.patch("/:id", authenticateToken, allowRoles("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, failure_reason } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    const previousStatus = payment.status;
    payment.status = status;
    if (failure_reason) payment.failure_reason = failure_reason;
    await payment.save();

    const orderStatus = status === "SUCCESS" ? "completed" : status === "FAILED" ? "cancelled" : "pending";
    const courseIds = payment.courseIds || [];

    // Check if order exists
    let order = await Order.findOne({ where: { payment_id: id } });

    if (!order) {
      order = await Order.create({
        userId: payment.userId,
        totalAmount: payment.total_amount,
        quantity: courseIds.length,
        status: orderStatus,
        payment_id: id,
      });

      if (courseIds.length > 0) {
        await OrderCourses.bulkCreate(courseIds.map((cId) => ({ orderId: order.orderId, courseId: cId })));
      }
    } else {
      order.status = orderStatus;
      await order.save();
    }

    if (status === "SUCCESS" && previousStatus !== "SUCCESS") {
      const existingComm = await Commission.findOne({ where: { orderId: order.orderId } });

      if (!existingComm) {
        try {
          await processCommission(payment.userId, order.orderId, payment.total_amount);
          console.log(`✅ Commission distributed for order ${order.orderId}`);
        } catch (err) {
          console.error("⚠️ Commission Error:", err.message);
        }
      } else {
        console.log("ℹ️ Commission already exists for this order. Skipping to avoid duplication.");
      }
    }


    const finalData = await Order.findOne({
      where: { orderId: order.orderId },
      include: [
        { model: User, as: "user", attributes: ["name", "email", "userId"] },
        { model: Payment, as: "payment" },
        { model: Courses, as: "ordered_courses", through: { attributes: [] } },
      ],
    });

    res.json({ success: true, order: finalData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default changePaymentStatus;