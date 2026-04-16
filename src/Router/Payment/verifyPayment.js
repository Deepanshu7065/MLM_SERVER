// import { Router } from "express";
// import crypto from "crypto";
// import Payment from "../../Modal/Payment.modal.js";
// import Order from "../../Modal/order.js";
// import OrderCourses from "../../Modal/OrderCourse.modal.js";
// import User from "../../Modal/User.modal.js";
// import Courses from "../../Modal/courses.modal.js";
// import { authenticateToken } from "../../../middleware/authentication.js";
// import { processCommission } from "../../service/commissionServices.js";

// const verifyPayment = Router();

// // POST /api/payment/verify
// // Razorpay payment success ke baad frontend yahan call karega
// verifyPayment.post("/", authenticateToken, async (req, res) => {
//   try {
//     const {
//       payment_db_id,
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     } = req.body;

//     // 1. Signature verify karo — security ke liye zaroori hai
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Invalid signature — payment tampered" });
//     }

//     // 2. DB mein payment dhundo
//     const payment = await Payment.findByPk(payment_db_id);
//     if (!payment) return res.status(404).json({ error: "Payment record not found" });

//     // Duplicate verify se bachao
//     if (payment.status === "SUCCESS") {
//       return res.status(200).json({ success: true, message: "Already verified" });
//     }

//     // 3. Payment update karo — asli razorpay payment id save karo
//     await payment.update({
//       status: "SUCCESS",
//       payment_id: razorpay_payment_id,
//     });

//     const courseIds = payment.courseIds || [];

//     // 4. Order create karo
//     const order = await Order.create({
//       userId: payment.userId,
//       totalAmount: payment.total_amount,
//       quantity: courseIds.length,
//       status: "completed",
//       payment_id: payment.id,
//     });

//     // 5. OrderCourses junction table mein courses link karo
//     if (courseIds.length > 0) {
//       const orderItems = courseIds.map((cId) => ({
//         orderId: order.orderId,
//         courseId: cId,
//       }));
//       await OrderCourses.bulkCreate(orderItems);
//     }

//     // 6. Commission process karo
//     try {
//       await processCommission(payment.userId, order.orderId, payment.total_amount);
//       console.log(`✅ Commission processed for order ${order.orderId}`);
//     } catch (commissionError) {
//       console.error("⚠️ Commission error (non-fatal):", commissionError.message);
//     }

//     // 7. Final data with includes return karo
//     const finalOrder = await Order.findOne({
//       where: { orderId: order.orderId },
//       include: [
//         { model: User, as: "user", attributes: ["name", "email", "userId"] },
//         { model: Payment, as: "payment" },
//         {
//           model: Courses,
//           as: "ordered_courses",
//           through: { attributes: [] },
//         },
//       ],
//     });

//     res.json({ success: true, message: "Payment verified & order placed", order: finalOrder });
//   } catch (error) {
//     console.error("❌ Verify error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// export default verifyPayment;

import { Router } from "express";
import crypto from "crypto";
import Payment from "../../Modal/Payment.modal.js";
import Order from "../../Modal/order.js";
import OrderCourses from "../../Modal/OrderCourse.modal.js";
import User from "../../Modal/User.modal.js";
import Courses from "../../Modal/courses.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import { processCommission } from "../../service/commissionServices.js";

const verifyPayment = Router();

verifyPayment.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      payment_db_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const payment = await Payment.findByPk(payment_db_id);
    if (!payment) return res.status(404).json({ error: "Payment record not found" });

    if (payment.status === "SUCCESS") {
      return res.status(200).json({ success: true, message: "Already verified" });
    }

    // 1. Update Payment
    await payment.update({
      status: "SUCCESS",
      payment_id: razorpay_payment_id,
    });

    const courseIds = payment.courseIds || [];

    // 2. Create Order
    const order = await Order.create({
      userId: payment.userId,
      totalAmount: payment.total_amount,
      quantity: courseIds.length,
      status: "completed",
      payment_id: payment.id,
    });

    if (courseIds.length > 0) {
      const orderItems = courseIds.map((cId) => ({
        orderId: order.orderId,
        courseId: cId,
      }));
      await OrderCourses.bulkCreate(orderItems);
    }

    // 3. Process Commission
    try {
      await processCommission(payment.userId, order.orderId, payment.total_amount);
    } catch (commissionError) {
      console.error("⚠️ Commission error:", commissionError.message);
    }

    // 4. Final Data Return (Include Models as per your original code)
    const finalOrder = await Order.findOne({
      where: { orderId: order.orderId },
      include: [
        { model: User, as: "user", attributes: ["name", "email", "userId"] },
        { model: Payment, as: "payment" },
        { model: Courses, as: "ordered_courses", through: { attributes: [] } },
      ],
    });

    res.json({ success: true, message: "Payment verified & order placed", order: finalOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default verifyPayment;