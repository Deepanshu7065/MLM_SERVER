import { Router } from "express";
import Withdrawal from "../../Modal/Withdraw.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";


const withdrawalRouterPatch = Router();

withdrawalRouterPatch.patch("/:id", authenticateToken, async (req, res) => {
    try {
        // Only admin can update withdrawal status
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied. Admins only." });
        }
 
        const { id } = req.params;
        const { status, transactionId, remarks } = req.body;
 
        // Validate status value
        const allowedStatuses = ["PENDING", "SUCCESS", "REJECTED"];
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value." });
        }
 
        const withdrawal = await Withdrawal.findByPk(id);
 
        if (!withdrawal) {
            return res.status(404).json({ success: false, message: "Withdrawal request not found." });
        }
 
        // Build update payload — only update fields that are provided
        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (transactionId !== undefined) updateData.transactionId = transactionId;
        if (remarks !== undefined) updateData.remarks = remarks;
 
        await withdrawal.update(updateData);
 
        res.json({
            success: true,
            message: "Withdrawal status updated successfully.",
            withdrawal,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default withdrawalRouterPatch;