import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../Modal/User.modal.js";
import Wallet from "../../Modal/Wallet.modal.js";

const createUser = Router();

createUser.post("/", async (req, res) => {
  try {
    const { name, email, password, phone, referalCode } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if email already exists
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: "Email already exists" });
    }

    let parent_code = null;
    let ref_by_id = null;
    let referredByUser = null;

    // Handle referral code
    if (referalCode) {
      const parent = await User.findOne({ where: { referalCode } });
      if (!parent) {
        return res.status(400).json({ error: "Invalid referral code" });
      }
      parent_code = parent.referalCode;
      ref_by_id = parent.id;

      referredByUser = {
        id: parent.id,
        name: parent.name,
        email: parent.email,
        userId: parent.userId,
        referalCode: parent.referalCode
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique userId
    let userId;
    do {
      userId = name.slice(0, 4).toUpperCase() +
        Math.random().toString(36).slice(2, 6).toUpperCase();
    } while (await User.findOne({ where: { userId } }));


    let personalReferalCode;
    do {
      personalReferalCode = name.slice(0, 4).toUpperCase() +
        Math.random().toString(36).slice(2, 5).toUpperCase() +
        Math.floor(1000 + Math.random() * 9000);
    } while (await User.findOne({ where: { referalCode: personalReferalCode } }));

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      userId,
      referalCode: personalReferalCode,
      parent_code,
      ref_by_id
    });
    await Wallet.create({ userId: user.userId, balance: 0.00 });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, userId: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    // ✅ COMPLETE RESPONSE
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userId: user.userId,
        referalCode: user.referalCode,
        parent_code: user.parent_code,
        ref_by_id: user.ref_by_id,
        created_at: user.created_at
      },
      referredBy: referredByUser
    });

  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default createUser;