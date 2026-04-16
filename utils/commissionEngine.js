
import Commission from "../src/Modal/Commission.modal.js";
import User from "../src/Modal/User.modal.js";

export const distributeCommission = async (orderId, buyerDbId, totalAmount) => {
    try {
        // 1. Buyer ko find karein taaki uske uplines (referrers) mil sakein
        const buyer = await User.findByPk(buyerDbId);
        if (!buyer || !buyer.ref_by_id) return; // Agar koi referrer nahi hai toh skip

        // ==========================================
        // LEVEL 1: Direct Referrer (30%)
        // ==========================================
        const level1Parent = await User.findByPk(buyer.ref_by_id);
        if (level1Parent) {
            const l1Amount = (totalAmount * 30) / 100;
            await Commission.create({
                orderId,
                userId: level1Parent.id,
                buyerId: buyerDbId,
                amount: l1Amount,
                percentage: 30,
                level: 1
            });

            // ==========================================
            // LEVEL 2: Grandparent (20%)
            // ==========================================
            if (level1Parent.ref_by_id) {
                const level2Parent = await User.findByPk(level1Parent.ref_by_id);
                if (level2Parent) {
                    const l2Amount = (totalAmount * 20) / 100;
                    await Commission.create({
                        orderId,
                        userId: level2Parent.id,
                        buyerId: buyerDbId,
                        amount: l2Amount,
                        percentage: 20,
                        level: 2
                    });
                }
            }
        }
        console.log(`Commission distributed for Order #${orderId}`);
    } catch (error) {
        console.error("Commission Distribution Error:", error);
    }
};