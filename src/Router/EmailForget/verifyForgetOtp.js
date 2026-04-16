
// import { Router } from "express";
// import User from "../../Modal/User.modal.js";
// import { otpStore } from "./forgetSendOtp.js";
// import { createTransporter } from "../EmailVerify/nodemailer.js";

// const verifyForgetOtp = Router();

// verifyForgetOtp.post("/", async (req, res) => {
//     try {
//         const { email, code } = req.body
//         if (!email || !code) {
//             return res.status(400).json({ error: "Missing required fields." });
//         }

//         const user = await User.findOne({ where: { email } });

//         if (!user) {
//             return res.status(404).json({ error: "User not found." });
//         }

//         const storedOtp = otpStore.get(String(email).toLocaleLowerCase());
//         if (!storedOtp || storedOtp.otp !== code || storedOtp.expiresAt < Date.now()) {
//             return res.status(401).json({ error: "Invalid OTP." });
//         }

//         if (String(code) === String(storedOtp.otp)) {
//             return res.status(200).json({ message: "OTP verified successfully.", success: true });
//         }


//     } catch (error) {
//         console.error("Error verifying OTP:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// })

// export default verifyForgetOtp;


// import { Router } from "express";
// import User from "../../Modal/User.modal.js";
// import { otpStore } from "./forgetSendOtp.js";

// const verifyForgetOtp = Router();

// verifyForgetOtp.post("/", async (req, res) => {
//   try {
//     const { email, code } = req.body;
//     if (!email || !code) return res.status(400).json({ success: false, error: "Missing fields" });

//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ success: false, error: "User not found" });

//     const stored = otpStore.get(email.toLowerCase());
//     if (!stored || stored.otp !== code || stored.expiresAt < Date.now()) {
//       return res.status(401).json({ success: false, error: "Invalid OTP" });
//     }

//     return res.status(200).json({ success: true, message: "OTP verified" });

//   } catch (error) {
//     console.error("Verify OTP Error:", error);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// export default verifyForgetOtp;
import { Router } from "express";
import redis from "../../../config/redisClient.js";
import User from "../../Modal/User.modal.js";
import jwt from "jsonwebtoken"; // <--- Ye MISSING tha

const verifyForgetOtp = Router();

verifyForgetOtp.post("/", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, error: "Missing fields" });

    const key = `otp:forget:${email.toLowerCase()}`;
    const storedOtp = await redis.get(key); 

    if (!storedOtp) return res.status(400).json({ success: false, error: "OTP expired" });


    if (String(storedOtp) !== String(code)) {
      return res.status(401).json({ success: false, error: "Invalid OTP" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    
    await redis.del(key);


    const token = jwt.sign(
      { id: user.id, email: user.email, userId: user.userId },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1h" }
    );

    return res.json({ success: true, token, message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default verifyForgetOtp;
