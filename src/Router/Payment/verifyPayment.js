import { Router } from "express";
import Payment from "../../Modal/Payment.modal.js";
import Order from "../../Modal/order.js";
import OrderCourses from "../../Modal/OrderCourse.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import { processCommission } from "../../service/commissionServices.js";
import { Cashfree } from "../../../config/cashfree.js";

const verifyPayment = Router();



verifyPayment.post("/", authenticateToken, async (req, res) => {
  try {
    const { order_id, payment_db_id } = req.body;

    // Cashfree se payments fetch karo
    const response = await Cashfree.PGOrderFetchPayments(order_id);
    const paymentData = response.data.find(
      (p) => p.payment_status === "SUCCESS"
    );

    if (!paymentData) {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }

    const payment = await Payment.findByPk(payment_db_id);
    if (!payment) return res.status(404).json({ error: "Record not found" });

    // Already verified ho chuka hai toh skip karo
    if (payment.status === "SUCCESS") {
      return res
        .status(200)
        .json({ success: true, message: "Already verified" });
    }

    // 1. Payment record update karo
    await payment.update({
      status: "SUCCESS",
      payment_id: paymentData.cf_payment_id,
    });

    // 2. Order create karo
    const courseIds = payment.courseIds || [];
    const order = await Order.create({
      userId: payment.userId,
      totalAmount: payment.total_amount,
      quantity: courseIds.length,
      status: "completed",
      payment_id: payment.id,
    });

    if (courseIds.length > 0) {
      await OrderCourses.bulkCreate(
        courseIds.map((cId) => ({
          orderId: order.orderId,
          courseId: cId,
        }))
      );
    }

    // 3. Commission process karo
    try {
      await processCommission(payment.userId, order.orderId, payment.total_amount);
    } catch (err) {
      console.error("Commission Error:", err.message);
    }

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error("❌ Verify Payment Error:", errMsg);
    
    res.status(500).json({ error: errMsg });
  }
});

export default verifyPayment;