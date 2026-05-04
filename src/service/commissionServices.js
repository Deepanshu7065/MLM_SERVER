// src/service/commissionServices.js
import User from "../Modal/User.modal.js";
import Wallet from "../Modal/Wallet.modal.js";
import Commission from "../Modal/Commission.modal.js";
import sequelize from "../DB/sequelize.js";

/**
 * Commission Distribution:
 * - Koi referral nahi  → 100% admin
 * - Sirf L1 hai        → 60% L1,       40% admin
 * - L1 + L2 dono hain  → 60% L1, 10% L2, 30% admin
 */
export async function processCommission(buyerUserId, orderId, totalAmount) {
    const transaction = await sequelize.transaction();

    try {
        // 1. Buyer dhundo
        const buyer = await User.findOne({ 
            where: { userId: buyerUserId },
            transaction 
        });
        
        if (!buyer) throw new Error(`Buyer not found: ${buyerUserId}`);

        // console.log(`🔄 Processing commission for order #${orderId}, buyer: ${buyerUserId}, amount: ₹${totalAmount}`);

        // Buyer ka wallet ensure karo
        await ensureWallet(buyerUserId, transaction);

        // Koi referral nahi → 100% admin
        if (!buyer.ref_by_id) {
            console.log(`ℹ️ No referral for buyer ${buyerUserId} → 100% to admin`);
            await transaction.commit();
            return { message: "No referral, 100% to admin" };
        }

        // ================================================
        // LEVEL 1: Direct Referrer → 60%
        // ================================================
        const level1User = await User.findOne({ 
            where: { id: buyer.ref_by_id },
            transaction 
        });

        if (!level1User) {
            console.log(`⚠️ L1 referrer not found (id: ${buyer.ref_by_id})`);
            await transaction.commit();
            return { message: "L1 referrer not found, 100% to admin" };
        }

        await ensureWallet(level1User.userId, transaction);

        const level1Amount = parseFloat((totalAmount * 0.60).toFixed(2));

        await Wallet.increment("balance", {
            by: level1Amount,
            where: { userId: level1User.userId },
            transaction
        });

        await Commission.create({
            userId:      level1User.userId,  // recipient
            buyerUserId: buyerUserId,         // buyer
            orderId,
            amount:      level1Amount,
            percentage:  60,
            level:       1,
            type:        "level1"
        }, { transaction });

        // console.log(`✅ L1 Commission: ₹${level1Amount} → ${level1User.userId} (${level1User.name})`);

        // ================================================
        // LEVEL 2: L1 ka Parent → 10%
        // ================================================
        if (level1User.ref_by_id) {
            const level2User = await User.findOne({ 
                where: { id: level1User.ref_by_id },
                transaction 
            });

            if (level2User) {
                await ensureWallet(level2User.userId, transaction);

                const level2Amount = parseFloat((totalAmount * 0.10).toFixed(2));

                await Wallet.increment("balance", {
                    by: level2Amount,
                    where: { userId: level2User.userId },
                    transaction
                });

                await Commission.create({
                    userId:      level2User.userId,
                    buyerUserId: buyerUserId,
                    orderId,
                    amount:      level2Amount,
                    percentage:  10,
                    level:       2,
                    type:        "level2"
                }, { transaction });

                console.log(`✅ L2 Commission: ₹${level2Amount} → ${level2User.userId} (${level2User.name})`);
            }
        }

        await transaction.commit();
        console.log(`🎉 Commission processing complete for order #${orderId}`);
        return { message: "Commission processed successfully" };

    } catch (error) {
        await transaction.rollback();
        console.error("❌ Commission processing error:", error.message);
        throw error;
    }
}

// Helper: Wallet nahi hai to create karo
async function ensureWallet(userId, transaction) {
    const existing = await Wallet.findOne({ where: { userId }, transaction });
    if (!existing) {
        await Wallet.create({ userId, balance: 0.00 }, { transaction });
        console.log(`📁 Wallet created for: ${userId}`);
    }
}