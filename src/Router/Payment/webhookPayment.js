import { Router } from "express";
import Payment from "../../Modal/Payment.modal.js";
import Order from "../../Modal/order.js";
import OrderCourses from "../../Modal/OrderCourse.modal.js";
import { processCommission } from "../../service/commissionServices.js";
import { Cashfree } from "../../../config/cashfree.js";

const webhookPayment = Router();



webhookPayment.post("/", async (req, res) => {
  try {
    // ✅ Cashfree Webhook Signature Verify
    const webhookSignature = req.headers["x-webhook-signature"];
    const webhookTimestamp = req.headers["x-webhook-timestamp"];

    try {
      Cashfree.PGVerifyWebhookSignature(
        webhookSignature,
        req.rawBody, // Express mein rawBody middleware lagana hoga
        webhookTimestamp
      );
    } catch (signErr) {
      console.error("❌ Webhook signature verification failed:", signErr.message);
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = req.body;
    const eventType = event?.type;
    const orderData = event?.data?.order;
    const paymentData = event?.data?.payment;

    // ✅ Payment SUCCESS event
    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      const cashfreeOrderId = orderData?.order_id;
      const cfPaymentId = paymentData?.cf_payment_id;

      const payment = await Payment.findOne({
        where: { payment_id: cashfreeOrderId },
      });

      if (payment && payment.status !== "SUCCESS") {
        await payment.update({
          status: "SUCCESS",
          payment_id: cfPaymentId,
        });

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

        try {
          await processCommission(
            payment.userId,
            order.orderId,
            payment.total_amount
          );
        } catch (e) {
          console.error("Commission error:", e.message);
        }
      }
    }

    // ✅ Payment FAILED event
    if (eventType === "PAYMENT_FAILED_WEBHOOK") {
      const cashfreeOrderId = orderData?.order_id;
      const failureReason = paymentData?.payment_message || "Payment failed";

      await Payment.update(
        { status: "FAILED", failure_reason: failureReason },
        { where: { payment_id: cashfreeOrderId } }
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default webhookPayment;