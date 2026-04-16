

import { Router } from "express";
import User from "../../Modal/User.modal.js";

const users = Router();


users.get("/", async (req, res) => {
    try {
        console.log("🔍 Fetching users..."); // Log before query
        const users = await User.findAll({
            logging: console.log // Sequelize query log enable
        });
        console.log("📋 Found users:", users.length, users); // Log result
        res.status(200).json({ users });
    } catch (error) {
        console.error("❌ User fetch error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default users;