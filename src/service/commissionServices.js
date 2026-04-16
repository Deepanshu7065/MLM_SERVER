// src/services/commissionService.js
import User from "../Modal/User.modal.js";
import Wallet from "../Modal/Wallet.modal.js";
import Commission from "../Modal/Commission.modal.js";
import sequelize from "../DB/sequelize.js";

/**
 * Commission logic:
 * - No referral: 100% admin
 * - Level 1 (direct ref): 30% to referrer, 70% admin
 * - Level 2 (indirect ref): 30% to level1, 20% to level2, 50% admin
 * - Level 3+: same as level 2 (only 2 levels get commission)
 */
export async function processCommission(buyerUserId, orderId, totalAmount) {
    const transaction = await sequelize.transaction();

    try {
        // Buyer user fetch karo
        const buyer = await User.findOne({ where: { userId: buyerUserId } });
        if (!buyer) throw new Error("Buyer not found");

        // Ensure buyer ka wallet exist karta hai (0 balance)
        await ensureWallet(buyerUserId, transaction);

        // Agar buyer kisi referral se nahi aaya
        if (!buyer.ref_by_id) {
            // 100% admin ke pass, koi commission nahi
            await transaction.commit();
            return { message: "No referral, 100% to admin" };
        }

        // Level 1 referrer (direct parent)
        const level1User = await User.findOne({ where: { id: buyer.ref_by_id } });
        if (!level1User) {
            await transaction.commit();
            return { message: "Referrer not found" };
        }

        // Ensure level1 ka wallet exist karta hai
        await ensureWallet(level1User.userId, transaction);

        const level1Amount = parseFloat((totalAmount * 0.30).toFixed(2));

        // Level 1 wallet update
        await Wallet.increment("balance", {
            by: level1Amount,
            where: { userId: level1User.userId },
            transaction
        });

        // Commission record level 1
        await Commission.create({
            userId: level1User.userId,
            buyerUserId: buyerUserId,
            orderId: orderId,
            amount: level1Amount,
            percentage: 30,
            level: 1,
            type: "level1"
        }, { transaction });

        // Level 2 check (level1 ka parent)
        if (level1User.ref_by_id) {
            const level2User = await User.findOne({ where: { id: level1User.ref_by_id } });

            if (level2User) {
                await ensureWallet(level2User.userId, transaction);

                const level2Amount = parseFloat((totalAmount * 0.20).toFixed(2));

                // Level 2 wallet update
                await Wallet.increment("balance", {
                    by: level2Amount,
                    where: { userId: level2User.userId },
                    transaction
                });

                // Commission record level 2
                await Commission.create({
                    userId: level2User.userId,
                    buyerUserId: buyerUserId,
                    orderId: orderId,
                    amount: level2Amount,
                    percentage: 20,
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