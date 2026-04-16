import { Router } from "express";
import User from "../../Modal/User.modal.js";

const user = Router();

user.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findOne({
      where: { userId },
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "userId",
        "referalCode",
        "parent_code",
        "ref_by_id",
        "created_at",
        "updated_at",
        "role"
      ]
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let referredBy = null;

    // Get parent user details if exists
    if (currentUser.ref_by_id) {
      const parentUser = await User.findByPk(currentUser.ref_by_id, {
        attributes: ["id", "name", "email", "userId", "referalCode"]
      });
      
      if (parentUser) {
        referredBy = {
          id: parentUser.id,
          name: parentUser.name,
          email: parentUser.email,
          userId: parentUser.userId,
          referalCode: parentUser.referalCode
        };
      }
    }

    // Get all users referred by this user (downline)
    const downlineUsers = await User.findAll({
      where: { parent_code: currentUser.referalCode },
      attributes: ["id", "name", "email", "userId", "referalCode", "created_at"]
    });

    res.json({
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        userId: currentUser.userId,
        referalCode: currentUser.referalCode,
        parent_code: currentUser.parent_code,
        ref_by_id: currentUser.ref_by_id,
        created_at: currentUser.created_at,
        role: currentUser.role
      },
      referredBy: referredBy,
      totalDownline: downlineUsers.length,
      downlineUsers: downlineUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        userId: u.userId,
        referalCode: u.referalCode,
        joinedAt: u.created_at
      }))
    });

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default user;