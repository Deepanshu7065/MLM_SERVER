import { Router } from "express";
import { authenticateToken } from "../../../middleware/authentication.js";
import Withdrawal from "../../Modal/Withdraw.modal.js";


export const withdrawalUserRouterGet = Router();

withdrawalUserRouterGet.get("/", authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user; // Token se userId nikala

        const history = await Withdrawal.findAll({
            where: { userId },
            order: [["created_at", "DESC"]]
        });

        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


export default withdrawalUserRouterGet;