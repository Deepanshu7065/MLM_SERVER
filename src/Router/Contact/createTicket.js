import { Router } from "express";
import Contact from "../../Modal/Contact.modal.js";
import TicketMessage from "../../Modal/TicketMessage.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const createTickets = Router();

// Create Ticket
createTickets.post("/", authenticateToken, async (req, res) => {
    try {
        const { subject, message } = req.body;
        const ticket = await Contact.create({
            userId: req.user.userId,
            subject: subject
        });
        await TicketMessage.create({
            ticket_id: ticket.ticket_id,
            senderId: req.user.userId,
            message: message
        });

        res.status(201).json({ success: true, ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default createTickets