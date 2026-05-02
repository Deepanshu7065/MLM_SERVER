import { Router } from "express";
import Payment from "../../Modal/Payment.modal.js";
import Courses from "../../Modal/courses.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const getUserPayment = Router();

getUserPayment.get("/", authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.userId },
      order: [["created_at", "DESC"]],
    });

    // ✅ BUG FIX: payments.map sahi hai, Payment.map nahi
    const paymentsWithCourses = await Promise.all(
      payments.map(async (payment) => {
        const courseIds = payment.courseIds || [];
        let courses = [];
        if (courseIds.length > 0) {
          courses = await Courses.findAll({
            where: { id: courseIds },
            attributes: ["id", "course_name", "price", "image", "duration"],
          });
        }
        return { ...payment.toJSON(), courses };
      })
    );

    res.status(200).json({ success: true, payment: paymentsWithCourses });
  } catch (error) {
    console.error("❌ Payment fetch error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default getUserPayment;