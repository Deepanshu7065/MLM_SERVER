
import { Router } from "express";
import jwt from "jsonwebtoken";

const verifyToken = Router();

verifyToken.patch("/verify-token", async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");

        if (!decoded) {
            return res.status(401).json({ error: "Invalid token." });
        }

        res.status(200).json({ message: "Token verified successfully." });
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})