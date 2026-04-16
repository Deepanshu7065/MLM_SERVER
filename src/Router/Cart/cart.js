import { Router } from "express";
import CartItem from "../../Modal/Cart.modal.js";
import Courses from "../../Modal/courses.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const cartRouter = Router();

cartRouter.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const userIdFromToken = req.user.userId;

    const cart = await CartItem.findAll({
      where: { userId: req.params.userId },
      include: [{
        model: Courses,
        attributes: ['id', 'course_name', 'price', 'image', 'duration']
      }],
    });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default cartRouter;
