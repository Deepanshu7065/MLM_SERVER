import { Router } from "express";
import Payment from "../../Modal/Payment.modal.js";
import Courses from "../../Modal/courses.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const getUserPayment = Router();

// GET /api/payment/my — Logged in user ki apni payments
getUserPayment.get("/", authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.userId },
      order: [["created_at", "DESC"]],
    });

    const paymentsWithCourses = await Promise.all(
      payments.map(async (payment) => {
        const courseIds = payment.courseIds || [];  // BUG FIX: payment.courseIds tha, Payment.courseIds tha pehle
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


// import { Router } from "express";
// import { Courses, Payment } from "../../Modal/index.js";
// import { authenticateToken } from "../../../middleware/authentication.js";



// const getUserPayment = Router();

// getUserPayment.get("/", authenticateToken, async (req, res) => {
//   try {
//     const payments = await Payment.findAll({
//       where: { userId: req.user.userId },
//     });

//     const paymentsWithCourses = await Promise.all(
//       payments.map(async (payment) => {
//         const courseIds = Payment.courseIds || [];
//         let courses = [];
//         if (courseIds.length > 0) {
//           courses = await Courses.findAll({
//             where: { id: courseIds },
//             attributes: ["id", "course_name", "price", "image", "duration"],
//           });
//         }
//         return {
//           ...payment.toJSON(),
//           courses,
//         };
//       })
//     );

//     res.status(200).json({ payment: paymentsWithCourses });
//   } catch (error) {
//     console.error("❌ Payment fetch error:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// export default getUserPayment;