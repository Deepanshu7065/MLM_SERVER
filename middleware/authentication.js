import jwt from "jsonwebtoken";
import User from "../src/Modal/User.modal.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token missing" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const token = parts[1];

    // 1️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2️⃣ Always fetch fresh user from DB
    const user = await User.findByPk(decoded.id, {
      attributes: [
        "id",
        "userId",
        "role",
        "referalCode",
        "parent_code"
      ]
    });

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    // 3️⃣ Attach fresh user to request
    req.user = {
      id: user.id,
      userId: user.userId,
      role: user.role,
      referalCode: user.referalCode,
      parent_code: user.parent_code
    };

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(403).json({ error: "Token invalid or expired" });
  }
};


