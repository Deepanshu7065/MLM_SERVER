import { Router } from "express";
import User from "../../Modal/User.modal.js";
import { authenticateToken } from "../../../middleware/authentication.js";
import { Op } from "sequelize";

const myUsers = Router();

myUsers.get("/", authenticateToken, async (req, res) => {
  try {
    // Find current user
    const me = await User.findOne({
      where: { userId: req.user.userId },
    });

    if (!me) {
      return res.status(404).json({
        error: "User not found",
        searchedUserId: req.user.userId,
      });
    }

    // Find who referred this user
    const referredBy = me.ref_by_id
      ? await User.findByPk(me.ref_by_id, {
          attributes: ["id", "userId", "name", "email", "referalCode"],
        })
      : null;

    // ==========================================
    // LEVEL 1: Direct referrals
    // ==========================================
    const level1Users = await User.findAll({
      where: { parent_code: me.referalCode },
      attributes: [
        "id",
        "userId",
        "name",
        "email",
        "referalCode",
        "parent_code",
        "created_at",
      ],
      order: [["created_at", "ASC"]],
    });

    // ==========================================
    // LEVEL 2: Grandchildren (children of level 1)
    // ==========================================
    let level2Users = [];

    if (level1Users.length > 0) {
      const level1Codes = level1Users.map((u) => u.referalCode);

      level2Users = await User.findAll({
        where: {
          parent_code: {
            [Op.in]: level1Codes,
          },
        },
        attributes: [
          "id",
          "userId",
          "name",
          "email",
          "referalCode",
          "parent_code",
          "created_at",
        ],
        order: [["created_at", "ASC"]],
      });
    }

    // ==========================================
    // BUILD HIERARCHICAL TREE
    // ==========================================
    const downlineTree = level1Users.map((l1User) => {
      // Find all children of this level 1 user
      const children = level2Users
        .filter((l2User) => l2User.parent_code === l1User.referalCode)
        .map((child) => ({
          id: child.id,
          userId: child.userId,
          name: child.name,
          email: child.email,
          referalCode: child.referalCode,
          joinedAt: child.created_at,
          level: 2,
        }));

      return {
        id: l1User.id,
        userId: l1User.userId,
        name: l1User.name,
        email: l1User.email,
        referalCode: l1User.referalCode,
        joinedAt: l1User.created_at,
        level: 1,
        childrenCount: children.length,
        children: children,
      };
    });

    const totalDownline = level1Users.length + level2Users.length;

    // ==========================================
    // RESPONSE
    // ==========================================
    res.json({
      me: {
        id: me.id,
        userId: me.userId,
        name: me.name,
        email: me.email,
        referalCode: me.referalCode,
        parent_code: me.parent_code,
      },
      referredBy: referredBy
        ? {
            id: referredBy.id,
            userId: referredBy.userId,
            name: referredBy.name,
            email: referredBy.email,
            referalCode: referredBy.referalCode,
          }
        : null,
      stats: {
        totalDownline: totalDownline,
        level1Count: level1Users.length,
        level2Count: level2Users.length,
      },
      downlineTree: downlineTree,
    });
  } catch (err) {
    console.error("ERROR in /my-users:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

export default myUsers;