

// import { Router } from "express";
// import { otpStore } from "./sendEmail.js";
// import { createTransporter } from "./nodemailer.js";
// import jwt from "jsonwebtoken";
// import redis from "../../../config/redisClient.js";


// const verifyCode = Router();


// verifyCode.post("/", async (req, res) => {
//     try {
//         const { email, code } = req.body || {};
//         if (!email || !code) {
//             return res.status(400).json({ success: false, error: "email and code required" });
//         }

//         const record = otpStore.get(String(email).toLowerCase());
//         if (!record) {
//             return res.status(400).json({ success: false, error: "No OTP found or expired" });
//         }

//         if (Date.now() > record.expiresAt) {
//             if (record.timeoutId) clearTimeout(record.timeoutId);
//             otpStore.delete(String(email).toLowerCase());
//             return res.status(400).json({ success: false, error: "OTP expired" });
//         }

//         if (String(code) === String(record.code)) {
//             await redis.del(key);

//             // otpStore.delete(String(email).toLowerCase());

//             const token = jwt.sign({ email },
//                 process.env.JWT_SECRET || "mysecretkey", { expiresIn: "2d" });
//             res.cookie("token", token, { httpOnly: true });

//             return res.json({ success: true, message: "OTP verified", token, });
//         } 
//     } catch (err) {
//         console.error("Error verifying OTP:", err);
//         return res.status(500).json({ success: false, error: "Verification error" });
//     }
// });


// export default verifyCode;

import { Router } from "express";
import jwt from "jsonwebtoken";
import redis from "../../../config/redisClient.js";
import User from "../../Modal/User.modal.js";

const verifyCode = Router();

verifyCode.post("/", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, error: "email & code required" });

    const key = `otp:${email.toLowerCase()}`;
    const storedOtp = await redis.get(key);

    console.log("Stored OTP:", storedOtp);

    if (!storedOtp) return res.status(400).json({ success: false, error: "OTP expired" });
    if (storedOtp !== String(code)) return res.status(401).json({ success: false, error: "Invalid OTP" });

    await redis.del(key);

    const user = await User.findOne({ where: { email } });
    const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, { expiresIn: "2d" });

    return res.json({
      success: true,
      message: "OTP verified",
      token,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referalCode: user.referalCode,
        parent_code: user.parent_code,
      }
    });
  } catch {
    return res.status(500).json({ success: false, error: "Verification error" });
  }
});

export default verifyCode;
