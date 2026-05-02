// routes/Payment/createPayment.js
import { Router } from "express";
import { Cashfree } from "cashfree-pg";
import Payment from "../../Modal/Payment.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const createPayment = Router();

// Cashfree Configuration
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = "PRODUCTION"; 

createPayment.post("/", authenticateToken, async (req, res) => {
  try {
    const { amount, courseIds, customerName, customerEmail, customerPhone } = req.body;
    const userId = req.user.userId;

    // 1. Database mein pending payment record banayein
    const paymentRecord = await Payment.create({
      userId,
      total_amount: amount,
      courseIds: courseIds,
      status: "PENDING",
    });

    // 2. Cashfree Order Request
    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: `ORDER_${paymentRecord.id}_${Date.now()}`, // Unique Order ID
      customer_details: {
        customer_id: userId.toString(),
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `https://dm-advancetech.com/payment-status?order_id={order_id}`,
      },
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
    
    // Payment record mein order_id update karein (Cashfree wali)
    await paymentRecord.update({ payment_id: response.data.order_id });

    res.status(200).json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
      payment_db_id: paymentRecord.id
    });

  } catch (error) {
    console.error("Cashfree Order Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

export default createPayment;