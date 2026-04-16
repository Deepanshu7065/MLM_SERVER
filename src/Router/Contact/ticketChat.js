import { Router } from "express";
import TicketMessage from "../../Modal/TicketMessage.modal.js";
import Contact from "../../Modal/Contact.modal.js";
import User from "../../Modal/User.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const ticketChat = Router();

// 1. Get all messages for a ticket
ticketChat.get("/:ticketId", authenticateToken, async (req, res) => {
    try {
        const messages = await TicketMessage.findAll({
            where: { ticket_id: req.params.ticketId },
            include: [
                { model: User, as: 'sender', attributes: ['name', 'role'] },
                { model: Contact, attributes: ['subject', 'status', 'created_at'] }
            ],
            order: [['created_at', 'ASC']]
        });

        const ticketInfo = await Contact.findByPk(req.params.ticketId);

        res.json({
            success: true,
            messages,
            ticket: ticketInfo 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default ticketChat;