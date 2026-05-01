
import { Router } from "express";
import jwt from "jsonwebtoken";

const verifyToken = Router();

verifyToken.patch("/verify-token", async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: "Token is required." });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is missing in .env file");
            return res.status(500).json({ error: "Server configuration error." });
        }

        const decoded = jwt.verify(token, secret);

        res.status(200).json({
            success: true,
            message: "Token is valid.",
            user: decoded
        });

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                error: "Token expired",
                message: "Token has expired."
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                error: "Invalid token",
                message: "Token is invalid."
            });
        }

        console.error("Error verifying token:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});