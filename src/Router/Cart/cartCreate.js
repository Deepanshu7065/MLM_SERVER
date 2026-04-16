import { Router } from "express";
import CartItem from "../../Modal/Cart.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";


const createCart = Router();


createCart.post("/", authenticateToken, async (req, res) => {
    try {
        const { course_id } = req.body;
        const userIdFromToken = req.user.userId;
        if (!course_id) {
            return res.status(400).json({ message: "Course ID is required" });
        }

        const already = await CartItem.findOne({
            where: {
                userId: userIdFromToken,
                course_id: course_id
            }
        });;
        if (already) {
            return res.status(400).json({ message: "Course already in cart" });
        }

        await CartItem.create({
            userId: userIdFromToken,
            course_id
        });

        res.json({ message: "Course added to your cart successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



export default createCart;
