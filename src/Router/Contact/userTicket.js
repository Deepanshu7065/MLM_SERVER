import { Router } from "express";
import Contact from "../../Modal/Contact.modal.js";
import TicketMessage from "../../Modal/TicketMessage.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const userTickets = Router();


// Get My Tickets
userTickets.get("/", authenticateToken, async (req, res) => {
    try {
        const tickets = await Contact.findAll({
            where: { userId: req.user.userId },
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default userTickets;