import { Router } from "express";
import CartItem from "../../Modal/Cart.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";


const deleteCart = Router();

deleteCart.delete("/:course_id", authenticateToken, async (req, res) => {
    try {
        const { course_id } = req.params;
        const userIdFromToken = req.user.userId;

        const deleted = await CartItem.destroy({
            where: {
                course_id,
                userId: userIdFromToken
            }
        });

        if (!deleted) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        res.json({ message: "Removed from cart" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default deleteCart;