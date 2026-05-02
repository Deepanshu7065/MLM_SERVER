import { Router } from "express";
import Payment from "../../Modal/Payment.modal.js";
import Order from "../../Modal/order.js";
import OrderCourses from "../../Modal/OrderCourse.modal.js";
import User from "../../Modal/User.modal.js";
import Courses from "../../Modal/courses.modal.js";
import Commission from "../../Modal/Commission.modal.js"; // ✅ MISSING IMPORT FIX
import { authenticateToken } from "../../../middleware/authentication.js";
import { allowRoles } from "../../../middleware/roleMiddleware.js";
import { processCommission } from "../../service/commissionServices.js";

const changePaymentStatus = Router();

changePaymentStatus.patch(
  "/:id",
  authenticateToken,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, failure_reason } = req.body;

      const payment = await Payment.findByPk(id);
      if (!payment)
        return res.status(404).json({ error: "Payment not found" });

      const previousStatus = payment.status;
      payment.status = status;
      if (failure_reason) payment.failure_reason = failure_reason;
      await payment.save();

      const orderStatus =
        status === "SUCCESS"
          ? "completed"
          : status === "FAILED"
          ? "cancelled"
          : "pending";

      const courseIds = payment.courseIds || [];

      let order = await Order.findOne({ where: { payment_id: id } });

      if (!order) {
        order = await Order.create({
          userId: payment.userId,
          totalAmount: payment.total_amount,
          quantity: courseIds.length,
          status: orderStatus,
          payment_id: id,
        });

        if (courseIds.length > 0) {
          await OrderCourses.bulkCreate(
            courseIds.map((cId) => ({
              orderId: order.orderId,
              courseId: cId,
            }))
          );
        }
      } else {
        order.status = orderStatus;
        await order.save();
      }

      if (status === "SUCCESS" && previousStatus !== "SUCCESS") {
        const existingComm = await Commission.findOne({
          where: { orderId: order.orderId },
        });

        if (!existingComm) {
          try {
            await processCommission(
              payment.userId,
              order.orderId,
              payment.total_amount
            );
            console.log(`✅ Commission distributed for order ${order.orderId}`);
          } catch (err) {
            console.error("⚠️ Commission Error:", err.message);
          }
        } else {
          console.log(
            "ℹ️ Commission already exists for this order. Skipping."
          );
        }
      }

      const finalData = await Order.findOne({
        where: { orderId: order.orderId },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "email", "userId"],
          },
          { model: Payment, as: "payment" },
          {
            model: Courses,
            as: "ordered_courses",
            through: { attributes: [] },
          },
        ],
      });

      res.json({ success: true, order: finalData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default changePaymentStatus;