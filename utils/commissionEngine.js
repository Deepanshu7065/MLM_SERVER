import Commission from "../src/Modal/Commission.modal.js";
import User from "../src/Modal/User.modal.js";

export const distributeCommission = async (orderId, buyerDbId, totalAmount) => {
    try {
        const buyer = await User.findByPk(buyerDbId);
        if (!buyer || !buyer.ref_by_id) return; // No referrer, 100% admin

        // ==========================================
        // LEVEL 1: Direct Referrer (60%)
        // ==========================================
        const level1Parent = await User.findByPk(buyer.ref_by_id);
        if (level1Parent) {
            const l1Amount = (totalAmount * 60) / 100;
            await Commission.create({
                orderId,
                userId: level1Parent.id,
                buyerId: buyerDbId,
                amount: l1Amount,
                percentage: 60,
                level: 1
            });

            // ==========================================
            // LEVEL 2: Grandparent (10%)
            // ==========================================
            if (level1Parent.ref_by_id) {
                const level2Parent = await User.findByPk(level1Parent.ref_by_id);
                if (level2Parent) {
                    const l2Amount = (totalAmount * 10) / 100;
                    await Commission.create({
                        orderId,
                        userId: level2Parent.id,
                        buyerId: buyerDbId,
                        amount: l2Amount,
                        percentage: 10,
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