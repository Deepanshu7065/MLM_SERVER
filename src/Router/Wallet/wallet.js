// src/Router/Wallet/wallet.js
import { Router } from "express";
import Wallet from "../../Modal/Wallet.modal.js";
import Commission from "../../Modal/Commission.modal.js";
import User from "../../Modal/User.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const walletRouter = Router();

// User apna wallet balance dekhe
walletRouter.get("/my-wallet", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // JWT me userId hona chahiye

    let wallet = await Wallet.findOne({ where: { userId } });

    // Agar wallet nahi hai to create karo
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0.00 });
    }

    // Commission history bhi do
    const commissions = await Commission.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["name", "email", "userId"]
        }
      ],
      order: [["created_at", "DESC"]],
      limit: 20
    });

    // Summary
    const totalEarned = commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const level1Total = commissions
      .filter(c => c.level === 1)
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const level2Total = commissions
      .filter(c => c.level === 2)
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    res.json({
      success: true,
      wallet: {
        balance: parseFloat(wallet.balance),
        totalEarned: parseFloat(totalEarned.toFixed(2)),
        level1Earnings: parseFloat(level1Total.toFixed(2)),
        level2Earnings: parseFloat(level2Total.toFixed(2)),
      },
      transactions: commissions
    });
  } catch (err) {
    console.error("Wallet error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default walletRouter;