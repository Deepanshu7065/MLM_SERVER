import { Router } from "express";
import Payment from "../../Modal/Payment.modal.js";
import Courses from "../../Modal/courses.modal.js";
import User from "../../Modal/User.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import { allowRoles } from "../../../middleware/roleMiddleware.js";

const getPayment = Router();

// GET /api/payment/ — Admin only
getPayment.get("/", authenticateToken, allowRoles("admin"), async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{ model: User, as: "user", attributes: ["name", "email", "userId"] }],
      order: [["created_at", "DESC"]],
    });

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

export default getPayment;


// import { Router } from "express";
// import Payment from "../../Modal/Payment.modal.js";
// import Courses from "../../Modal/courses.modal.js";
// import User from "../../Modal/User.modal.js";
// import { authenticateToken } from "../../../middleware/authentication.js";
// import { allowRoles } from "../../../middleware/roleMiddleware.js";

// const getPayment = Router();

// getPayment.get("/", authenticateToken, allowRoles("admin"), async (req, res) => {
//   try {
//     const payments = await Payment.findAll({
//       include: [
//         {
//           model: User,
//           attributes: ["name", "email", "userId"],
//         },
//       ],
//     });

//     const paymentsWithCourses = await Promise.all(
//       payments.map(async (payment) => {
//         const courseIds = payment.courseIds || [];
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

// export default getPayment;