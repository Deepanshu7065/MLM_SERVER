
// import { Router } from "express";
// import Contact from "../../Modal/Contact.modal.js";
// import User from "../../Modal/User.modal.js";
// import { authenticateToken } from "../../../middleware/authentication.js";
// import { allowRoles } from "../../../middleware/roleMiddleware.js";

// const updateTicketStatus = Router();


// updateTicketStatus.patch("/:id", authenticateToken, allowRoles("admin"), async (req, res) => {
//     try {
//         const { status } = req.body;
//         await Contact.update({ status }, { where: { ticket_id: req.params.id } });
//         res.json({ success: true, message: `Ticket ${status} successfully` });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// export default updateTicketStatus



import { Router } from "express";
import Contact from "../../Modal/Contact.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import { allowRoles } from "../../../middleware/roleMiddleware.js";

const updateTicketStatus = Router();

updateTicketStatus.patch("/:id", authenticateToken, allowRoles("admin"), async (req, res) => {
    try {
        const { status } = req.body;


        if (!['open', 'closed'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status. Use 'open' or 'closed'" });
        }

        await Contact.update({ status }, { where: { ticket_id: req.params.id } });

        res.json({ success: true, message: `Ticket ${status === 'closed' ? 'resolved' : 'reopened'} successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default updateTicketStatus;