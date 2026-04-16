import { Router } from "express";
import Razorpay from "razorpay";
import CartItem from "../../Modal/Cart.modal.js";
import Courses from "../../Modal/courses.modal.js";
import Payment from "../../Modal/Payment.modal.js";
import User from "../../Modal/User.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const checkoutRouter = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/checkout
// User cart se Razorpay order banata hai
checkoutRouter.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, email } = req.body;

    const user = await User.findOne({ where: { userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Cart items fetch karo
    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [{ model: Courses, as: "courses" }],
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const courseIds = cartItems.map((item) => item.course_id);

    // Total amount calculate karo
    const total_amount = cartItems.reduce((sum, item) => {
      return sum + (item.courses?.price || 0);
    }, 0);

    if (total_amount <= 0) {
      return res.status(400).json({ message: "Invalid cart amount" });
    }

    // Razorpay order create karo
    const razorOptions = {
      amount: total_amount * 100, // paise mein
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const razorOrder = await razorpay.orders.create(razorOptions);

    // DB mein PENDING payment save karo
    const payment = await Payment.create({
      userId,
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      total_amount,
      payment_id: razorOrder.id,
      payment_method: "razorpay",
      status: "PENDING",
      courseIds,
    });

    res.json({
      success: true,
      razorpay_order_id: razorOrder.id,
      amount: razorOrder.amount,
      currency: razorOrder.currency,
      payment_db_id: payment.id,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("❌ Checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default checkoutRouter;

// import { Router } from "express";
// import CartItem from "../../Modal/Cart.modal.js";
// import Courses from "../../Modal/courses.modal.js";
// import Payment from "../../Modal/Payment.modal.js";
// import User from "../../Modal/User.modal.js";

// const checkoutRouter = Router();

// checkoutRouter.post("/", async (req, res) => {
//   try {
//     const {
//       userId,
//       payment_method,
//       payment_id,
//       name,
//       phone,
//       email,
//       total_amount,
//     } = req.body;

//     const user = await User.findOne({ where: { userId } });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const cartItems = await CartItem.findAll({
//       where: { userId },
//       include: [{ model: Courses, as: "courses" }],
//     });

//     if (!cartItems || cartItems.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     const courseIds = cartItems.map((item) => item.course_id);

//     const payment = await Payment.create({
//       userId: userId,
//       name: name,
//       email: email,
//       phone: phone,
//       total_amount: total_amount,
//       payment_id,
//       payment_method,
//       status: "PENDING",
//       courseIds: courseIds,
//     });

//     await CartItem.destroy({ where: { userId } });

//     res.json({
//       message: "Payment initiated, courses saved with payment",
//       payment,
//       courseIds,
//     });
//   } catch (err) {
//     console.error("❌ Checkout error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// export default checkoutRouter;