// src/Router/Admin/adminWallet.js
import { Router } from "express";
import Wallet from "../../Modal/Wallet.modal.js";
import Commission from "../../Modal/Commission.modal.js";
import User from "../../Modal/User.modal.js";
import Payment from "../../Modal/Payment.modal.js";
import Order from "../../Modal/order.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import { allowRoles } from "../../../middleware/roleMiddleware.js";

const adminWalletRouter = Router();

// ✅ All Wallets — as: "user" add kiya
adminWalletRouter.get("/all-wallets", authenticateToken, allowRoles("admin"), async (req, res) => {
    try {
        const wallets = await Wallet.findAll({
            include: [
                {
                    model: User,
                    as: "user",                                          // ← FIX
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

// ✅ All Commissions — with full order + buyer + recipient details
adminWalletRouter.get("/all-commissions", authenticateToken, allowRoles("admin"), async (req, res) => {
    try {
        // ── Pagination params ──
        const paymentPage = parseInt(req.query.paymentPage) || 1;
        const summaryPage = parseInt(req.query.summaryPage) || 1;
        const limit = 15;

        const commissions = await Commission.findAll({
            include: [
                { model: User, as: "recipient", attributes: ["name", "email", "userId"] },
                { model: User, as: "buyer",     attributes: ["name", "email", "userId"] }
            ],
            order: [["created_at", "DESC"]]
        });

        const totalPaid = commissions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
        const totalPayments = await Payment.sum("total_amount", { where: { status: "SUCCESS" } }) || 0;
        const adminProfit = totalPayments - totalPaid;

        // ── All payments paginated ──
        const { count: totalPaymentCount, rows: payments } = await Payment.findAndCountAll({
            include: [{ model: User, as: "user", attributes: ["name", "email", "userId", "phone"] }],
            order: [["created_at", "DESC"]],
            limit,
            offset: (paymentPage - 1) * limit,
        });

        // ── User summary paginated ──
        // Pehle saare payments fetch karo grouping ke liye (sirf fields chahiye)
        const allPaymentsForSummary = await Payment.findAll({
            attributes: ["userId", "total_amount", "status"],
            include: [{ model: User, as: "user", attributes: ["name", "email", "userId"] }],
        });

        const userSummaryMap = {};
        allPaymentsForSummary.forEach(p => {
            const uid = p.userId;
            if (!userSummaryMap[uid]) {
                userSummaryMap[uid] = {
                    userId: uid,
                    name:   p.user?.name  ?? "Unknown",
                    email:  p.user?.email ?? "",
                    totalPaid:    0,
                    successCount: 0,
                    failedCount:  0,
                    pendingCount: 0,
                };
            }
            if (p.status === "SUCCESS") {
                userSummaryMap[uid].totalPaid += parseFloat(p.total_amount || 0);
                userSummaryMap[uid].successCount++;
            } else if (p.status === "FAILED") {
                userSummaryMap[uid].failedCount++;
            } else {
                userSummaryMap[uid].pendingCount++;
            }
        });

        const allUserSummary = Object.values(userSummaryMap)
            .sort((a, b) => b.totalPaid - a.totalPaid);

        // Paginate user summary
        const totalSummaryCount = allUserSummary.length;
        const paginatedUserSummary = allUserSummary.slice(
            (summaryPage - 1) * limit,
            summaryPage * limit
        );

        // ── Wallets ──
        const wallets = await Wallet.findAll({
            include: [{ model: User, as: "user", attributes: ["name", "email", "userId", "phone"] }],
            order: [["balance", "DESC"]]
        });

        res.json({
            success: true,
            summary: {
                totalCommissionPaid: parseFloat(totalPaid.toFixed(2)),
                totalRevenue:        parseFloat(String(totalPayments)),
                adminProfit:         parseFloat(adminProfit.toFixed(2))
            },
            commissions,
            wallets,
            // Paginated
            payments,
            paymentMeta: {
                total:       totalPaymentCount,
                page:        paymentPage,
                totalPages:  Math.ceil(totalPaymentCount / limit),
                limit,
            },
            userSummary: paginatedUserSummary,
            summaryMeta: {
                total:       totalSummaryCount,
                page:        summaryPage,
                totalPages:  Math.ceil(totalSummaryCount / limit),
                limit,
            }
        });

    } catch (err) {
        console.error("❌ Commission fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});


// ✅ Specific user wallet + commissions
adminWalletRouter.get("/user-wallet/:userId", authenticateToken, allowRoles("admin"), async (req, res) => {
    try {
        const { userId } = req.params;

        const wallet = await Wallet.findOne({
            where: { userId },
            include: [{ model: User, as: "user", attributes: ["name", "email", "userId", "phone"] }]
        });

        const commissions = await Commission.findAll({
            where: { userId },
            include: [
                { model: User, as: "buyer", attributes: ["name", "email", "userId"] }
            ],
            order: [["created_at", "DESC"]]
        });

        const totalEarned = commissions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

        res.json({
            success: true,
            wallet: wallet
                ? { balance: parseFloat(wallet.balance), user: wallet.user }
                : { balance: 0 },
            totalEarned: parseFloat(totalEarned.toFixed(2)),
            commissions
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default adminWalletRouter;