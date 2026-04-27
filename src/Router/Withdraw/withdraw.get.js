import { Router } from "express";
import Withdrawal from "../../Modal/Withdraw.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

export const withdrawalRouterGet = Router();

// 1. SIRF USER KE LIYE (Apni history dekhne ke liye)
// Route: /history-withdraw/my


withdrawalRouterGet.get("/", authenticateToken, async (req, res) => {
    try {
        // Security check: Agar user admin nahi hai to block kar do
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied. Admins only." });
        }

        const history = await Withdrawal.findAll({
            order: [["created_at", "DESC"]]
        });

        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default withdrawalRouterGet;