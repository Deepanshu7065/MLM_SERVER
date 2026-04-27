import { Router } from "express";
import { authenticateToken } from "../../../middleware/authentication.js";
import sequelize from "../../DB/sequelize.js";
import Wallet from "../../Modal/Wallet.modal.js";
import Withdrawal from "../../Modal/Withdraw.modal.js";



const withdrawalRouterPost = Router();

withdrawalRouterPost.post("/", authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { userId } = req.user;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        const wallet = await Wallet.findOne({ where: { userId }, transaction });

        if (!wallet || parseFloat(wallet.balance) < parseFloat(amount)) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: "Insufficient balance in wallet" });
        }

        // 1. Wallet se balance deduct karo (Hold par rakhne ke liye)
        await wallet.decrement("balance", { by: amount, transaction });

        // 2. Withdrawal entry create karo
        const request = await Withdrawal.create({
            userId,
            amount,
            status: "PENDING"
        }, { transaction });

        await transaction.commit();
        res.json({ success: true, message: "Withdrawal request submitted", data: request });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, error: error.message });
    }
});


export default withdrawalRouterPost;