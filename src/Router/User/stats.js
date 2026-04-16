import { Router } from "express";
import { Commission, User, Order } from "../../Modal/index.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import sequelize from "../../DB/sequelize.js";

const userStats = Router();

userStats.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // DB primary key id

        // 1. Total Earnings calculate karein
        const totalEarnings = await Commission.sum('amount', {
            where: { userId: userId }
        }) || 0;

        // 2. Level wise breakdown
        const level1Earnings = await Commission.sum('amount', {
            where: { userId: userId, level: 1 }
        }) || 0;

        const level2Earnings = await Commission.sum('amount', {
            where: { userId: userId, level: 2 }
        }) || 0;

        // 3. Recent Commission Transactions
        const transactions = await Commission.findAll({
            where: { userId: userId },
            include: [
                { 
                    model: User, 
                    as: 'buyer', // Iske liye model association karni hogi niche dekhiye
                    attributes: ['name', 'email'] 
                }
            ],
            limit: 10,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            stats: {
                totalEarnings,
                level1Earnings,
                level2Earnings,
                adminProfitContribution: totalEarnings * 0.1 // Just an example
            },
            transactions
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default userStats;