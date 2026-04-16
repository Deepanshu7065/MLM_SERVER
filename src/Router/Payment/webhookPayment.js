// import { Router } from "express";
// import crypto from "crypto";
// import Payment from "../../Modal/Payment.modal.js";
// import Order from "../../Modal/order.js";
// import OrderCourses from "../../Modal/OrderCourse.modal.js";
// import { processCommission } from "../../service/commissionServices.js";

// const webhookPayment = Router();

// // POST /api/payment/webhook
// // Razorpay server se automatic event aata hai yahan
// // IMPORTANT: Raw body chahiye signature verify ke liye — express.json() se pehle lagao
// webhookPayment.post(
//   "/",
//   (req, res, next) => {
//     // Raw body buffer store karo
//     let rawBody = "";
//     req.on("data", (chunk) => { rawBody += chunk; });
//     req.on("end", () => {
//       req.rawBody = rawBody;
//       next();
//     });
//   },
//   async (req, res) => {
//     try {
//       // 1. Webhook signature verify karo
//       const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
//       const signature = req.headers["x-razorpay-signature"];

//       const expectedSignature = crypto
//         .createHmac("sha256", webhookSecret)
//         .update(req.rawBody)
//         .digest("hex");

//       if (expectedSignature !== signature) {
//         console.warn("⚠️ Invalid webhook signature");
//         return res.status(400).json({ message: "Invalid signature" });
//       }

//       const event = JSON.parse(req.rawBody);
//       console.log("📦 Webhook event:", event.event);

//       // 2. Sirf payment.captured event handle karo
//       if (event.event === "payment.captured") {
//         const razorPayload = event.payload.payment.entity;
//         const razorpay_order_id = razorPayload.order_id;
//         const razorpay_payment_id = razorPayload.id;

//         // Razorpay order_id se humara payment dhundo
//         const payment = await Payment.findOne({
//           where: { payment_id: razorpay_order_id },
//         });

//         if (!payment) {
//           console.warn("Payment record not found for order:", razorpay_order_id);
//           return res.status(200).json({ message: "Payment not found, ignored" });
//         }

//         if (payment.status === "SUCCESS") {
//           return res.status(200).json({ message: "Already processed" });
//         }

//         // Update payment
//         await payment.update({
//           status: "SUCCESS",
//           payment_id: razorpay_payment_id,
//         });

//         const courseIds = payment.courseIds || [];

//         // Order create karo
//         const order = await Order.create({
//           userId: payment.userId,
//           totalAmount: payment.total_amount,
//           quantity: courseIds.length,
//           status: "completed",
//           payment_id: payment.id,
//         });

//         if (courseIds.length > 0) {
//           await OrderCourses.bulkCreate(
//             courseIds.map((cId) => ({ orderId: order.orderId, courseId: cId }))
//           );
//         }

//         try {
//           await processCommission(payment.userId, order.orderId, payment.total_amount);
//         } catch (e) {
//           console.error("⚠️ Commission error:", e.message);
//         }
//       }

//       if (event.event === "payment.failed") {
//         const razorPayload = event.payload.payment.entity;
//         await Payment.update(
//           { status: "FAILED", failure_reason: razorPayload.error_description },
//           { where: { payment_id: razorPayload.order_id } }
//         );
//       }

//       res.status(200).json({ received: true });
//     } catch (error) {
//       console.error("❌ Webhook error:", error);
//       res.status(500).json({ error: error.message });
//     }
//   }
// );

// export default webhookPayment;


import { Router } from "express";
import crypto from "crypto";
import Payment from "../../Modal/Payment.modal.js";
import Order from "../../Modal/order.js";
import OrderCourses from "../../Modal/OrderCourse.modal.js";
import { processCommission } from "../../service/commissionServices.js";

const webhookPayment = Router();

webhookPayment.post("/", async (req, res) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers["x-razorpay-signature"];

      // Verify Webhook Signature (If rawBody logic is active)
      // const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(req.rawBody).digest("hex");
      
      const event = req.body;

      if (event.event === "payment.captured") {
        const razorPayload = event.payload.payment.entity;
        const razorpay_order_id = razorPayload.order_id;
        const razorpay_payment_id = razorPayload.id;

        const payment = await Payment.findOne({ where: { payment_id: razorpay_order_id } });

        if (payment && payment.status !== "SUCCESS") {
          await payment.update({
            status: "SUCCESS",
            payment_id: razorpay_payment_id,
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
            await OrderCourses.bulkCreate(courseIds.map((cId) => ({ orderId: order.orderId, courseId: cId })));
          }

          try {
            await processCommission(payment.userId, order.orderId, payment.total_amount);
          } catch (e) { console.error("Commission error:", e.message); }
        }
      }

      if (event.event === "payment.failed") {
        const razorPayload = event.payload.payment.entity;
        await Payment.update(
          { status: "FAILED", failure_reason: razorPayload.error_description },
          { where: { payment_id: razorPayload.order_id } }
        );
      }

      res.status(200).json({ received: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

export default webhookPayment;