import { Router } from "express";
import Payment from "../../Modal/Payment.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import { Cashfree } from "../../../config/cashfree.js";


const createPayment = Router();

createPayment.post("/", authenticateToken, async (req, res) => {
  try {
    const { total_amount, courseIds, name, email, phone } = req.body;
    const userId = req.user.userId;

    if (!total_amount || !phone) {
      return res.status(400).json({ error: "Amount and Phone are required" });
    }

    const paymentRecord = await Payment.create({
      userId,
      total_amount,
      courseIds,
      status: "PENDING",
    });

    const request = {
      order_amount: total_amount,
      order_currency: "INR",
      order_id: `ORDER_${paymentRecord.id}_${Date.now()}`,
      customer_details: {
        customer_id: userId.toString(),
        customer_name: name || "Customer",
        customer_email: email || "test@gmail.com",
        customer_phone: phone.toString(),
      },
      order_meta: {
        return_url: `https://dm-advancetech.com/payment-status?order_id={order_id}`,
      },
    };

    const response = await Cashfree.PGCreateOrder(request);

    await paymentRecord.update({ payment_id: response.data.order_id });

    res.status(200).json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
      payment_db_id: paymentRecord.id,
    });
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error("❌ Cashfree Error:", errMsg);
    res.status(500).json({ error: errMsg });
  }
});

export default createPayment;