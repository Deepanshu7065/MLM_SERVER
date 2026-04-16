import { Router } from "express";
import TicketMessage from "../../Modal/TicketMessage.modal.js";
import Contact from "../../Modal/Contact.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const ticketChatPost = Router();

ticketChatPost.post("/", authenticateToken, async (req, res) => {
    try {
        const { ticket_id, message } = req.body;

        const ticket = await Contact.findByPk(ticket_id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }
        if (ticket.status === 'closed') {
            return res.status(400).json({ success: false, message: "Ticket is closed" });
        }

        const newMessage = await TicketMessage.create({
            ticket_id,
            senderId: req.user.userId,
            message
        });

        const messagePayload = {
            id: newMessage.id,
            ticket_id: String(ticket_id),
            message: newMessage.message,
            sender: { role: req.user.role },
            // ✅ created_at fix - Sequelize createdAt ko created_at naam se bhejo
            created_at: newMessage.created_at || newMessage.createdAt || new Date().toISOString()
        };

        req.io.to(String(ticket_id)).emit("receive_message", messagePayload);

        res.json({ success: true, data: messagePayload });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default ticketChatPost;