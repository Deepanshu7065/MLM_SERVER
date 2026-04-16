import { Router } from "express";
import { authenticateToken } from "../../../middleware/authentication.js";
import { allowRoles } from "../../../middleware/roleMiddleware.js";
import User from "../../Modal/User.modal.js";


const allUser = Router()


allUser.get("/", authenticateToken, allowRoles("admin"), async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json({ users });
    } catch (error) {
        console.error("❌ User fetch error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});


export default allUser