// src/Router/Admin/adminWallet.js
import { Router } from "express";
import Wallet from "../../Modal/Wallet.modal.js";
import Commission from "../../Modal/Commission.modal.js";
import User from "../../Modal/User.modal.js";
import Payment from "../../Modal/Payment.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import { allowRoles } from "../../../middleware/roleMiddleware.js";
import sequelize from "../../DB/sequelize.js";

const adminWalletRouter = Router();

// Admin: Sabke wallets dekhe
adminWalletRouter.get("/all-wallets", authenticateToken, allowRoles("admin"), async (req, res) => {
    try {
        const wallets = await Wallet.findAll({
            include: [
                {
                    model: User,
                    attributes: ["name", "email", "userId", "phone"]
                }
            ],
            order: [["balance", "DESC"]]
        });

        res.json({ success: true, wallets });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Saare commissions dekhe
adminWalletRouter.get("/all-commissions", authenticateToken, allowRoles("admin"), async (req, res) => {
    try {
        const commissions = await Commission.findAll({
            include: [
                {
                    model: User,
                    as: "recipient",
                    attributes: ["name", "email", "userId"]
                },
                {
                    model: User,
                    as: "buyer",
                    attributes: ["name", "email", "userId"]
                }
            ],
            order: [["created_at", "DESC"]]
        });

        // Total commission paid out
        const totalPaid = commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);

        // Total payments
        const totalPayments = await Payment.sum("total_amount", {
            where: { status: "SUCCESS" }
        }) || 0;

        const adminProfit = totalPayments - totalPaid;

        res.json({
            success: true,
            summary: {
                totalCommissionPaid: parseFloat(totalPaid.toFixed(2)),
                totalRevenue: parseFloat(totalPayments),
                adminProfit: parseFloat(adminProfit.toFixed(2))
            },
            commissions
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Specific user ka wallet + commission detail
adminWalletRouter.get("/user-wallet/:userId", authenticateToken, allowRoles("admin"), async (req, res) => {
    try {
        const { userId } = req.params;

        const wallet = await Wallet.findOne({ where: { userId } });
        const commissions = await Commission.findAll({
            where: { userId },
            include: [
                { model: User, as: "buyer", attributes: ["name", "email", "userId"] }
            ],
            order: [["created_at", "DESC"]]
        });

        res.json({
            success: true,
            wallet: wallet ? { balance: parseFloat(wallet.balance) } : { balance: 0 },
            commissions
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default adminWalletRouter;