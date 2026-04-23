// src/services/commissionService.js
import User from "../Modal/User.modal.js";
import Wallet from "../Modal/Wallet.modal.js";
import Commission from "../Modal/Commission.modal.js";
import sequelize from "../DB/sequelize.js";

/**
 * Commission logic:
 * - No referral:        100% admin
 * - L1 only (direct):   60% to L1, 40% admin
 * - L1 + L2 (indirect): 60% to L1, 10% to L2, 30% admin
 */
export async function processCommission(buyerUserId, orderId, totalAmount) {
    const transaction = await sequelize.transaction();

    try {
        const buyer = await User.findOne({ where: { userId: buyerUserId } });
        if (!buyer) throw new Error("Buyer not found");

        await ensureWallet(buyerUserId, transaction);

        // No referral → 100% admin
        if (!buyer.ref_by_id) {
            await transaction.commit();
            return { message: "No referral, 100% to admin" };
        }

        // ==========================================
        // LEVEL 1: Direct Referrer (60%)
        // ==========================================
        const level1User = await User.findOne({ where: { id: buyer.ref_by_id } });
        if (!level1User) {
            await transaction.commit();
            return { message: "Referrer not found" };
        }

        await ensureWallet(level1User.userId, transaction);

        const level1Amount = parseFloat((totalAmount * 0.60).toFixed(2));

        await Wallet.increment("balance", {
            by: level1Amount,
            where: { userId: level1User.userId },
            transaction
        });

        await Commission.create({
            userId: level1User.userId,
            buyerUserId,
            orderId,
            amount: level1Amount,
            percentage: 60,
            level: 1,
            type: "level1"
        }, { transaction });

        // ==========================================
        // LEVEL 2: L1 ka Parent (10%)
        // ==========================================
        if (level1User.ref_by_id) {
            const level2User = await User.findOne({ where: { id: level1User.ref_by_id } });

            if (level2User) {
                await ensureWallet(level2User.userId, transaction);

                const level2Amount = parseFloat((totalAmount * 0.10).toFixed(2));

                await Wallet.increment("balance", {
                    by: level2Amount,
                    where: { userId: level2User.userId },
                    transaction
                });

                await Commission.create({
                    userId: level2User.userId,
                    buyerUserId,
                    orderId,
                    amount: level2Amount,
                    percentage: 10,
                    level: 2,
                    type: "level2"
                }, { transaction });
            }
        }

        await transaction.commit();
        return { message: "Commission processed successfully" };

    } catch (error) {
        await transaction.rollback();
        console.error("Commission processing error:", error);
        throw error;
    }
}

// Helper: Wallet ensure karo (agar nahi hai to create karo)
async function ensureWallet(userId, transaction) {
    const existing = await Wallet.findOne({ where: { userId }, transaction });
    if (!existing) {
        await Wallet.create({ userId, balance: 0.00 }, { transaction });
    }
}