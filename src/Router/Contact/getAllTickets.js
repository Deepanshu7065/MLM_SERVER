import { Router } from "express";
import Contact from "../../Modal/Contact.modal.js";
import User from "../../Modal/User.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import { allowRoles } from "../../../middleware/roleMiddleware.js";

const getAllTickets = Router();

getAllTickets.get("/", authenticateToken, allowRoles("admin"), async (req, res) => {
    try {
        const tickets = await Contact.findAll({
            include: [{ model: User, attributes: ['name', 'email'] }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




export default getAllTickets;