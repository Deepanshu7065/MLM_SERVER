// import { Router } from "express";
// import crypto from "crypto";
// import { buildEmailHtml } from "./sendEmailHtml.js";
// import { createTransporter } from "./nodemailer.js";
// import User from "../../Modal/User.modal.js";

// const sendCode = Router();

// export const otpStore = new Map();

// function generateOtp() {
//   const num = crypto.randomInt(0, 10000);
//   return String(num).padStart(4, "0");
// }

// sendCode.post("/", async (req, res) => {
//   try {
//     const { userId, email } = req.body;

//     if (!userId || !email) {
//       return res.status(400).json({ error: "Missing required fields." });
//     }

//     // Check if user exists
//     const user = await User.findOne({ where: { userId, email } });
//     if (!user) return res.status(404).json({ error: "Invalid userId or email" });

//     // Check for existing OTP entry
//     const existingOtpData = otpStore.get(email);
//     const now = Date.now();
//     const TWO_MINUTES = 2 * 60 * 1000;

//     if (existingOtpData && now - existingOtpData.timestamp < TWO_MINUTES) {
//       const remaining = Math.ceil((TWO_MINUTES - (now - existingOtpData.timestamp)) / 1000);
//       return res.status(400).json({
//         error: `An OTP was already sent recently. Please wait ${remaining} seconds before requesting a new one.`,
//       });
//     }

//     // Generate new OTP
//     const code = generateOtp();
//     // Store OTP with timestamp
//     otpStore.set(email, {
//       code,
//       timestamp: now,
//     });
//     return res.status(200).json({ message: "OTP sent successfully.", success: true });

//     const html = buildEmailHtml({ name: userId, code });

//     const transporter = createTransporter();

//     const mailOptions = {
//       from: `Deepanshu Sender <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "OTP Verification",
//       html,
//     };

//     await transporter.sendMail(mailOptions);

//   } catch (err) {
//     console.error("Error sending OTP email:", err);
//     return res.status(500).json({ error: "Failed to send OTP email" });
//   }
// });

// export default sendCode;


// import { Router } from "express";
// import crypto from "crypto";
// import { buildEmailHtml } from "./sendEmailHtml.js";
// import { createTransporter } from "./nodemailer.js";
// import User from "../../Modal/User.modal.js";
// import redis from "../../../config/redisClient.js";

// export const otpStore = new Map();
// const sendCode = Router();

// function generateOtp() {
//   return String(crypto.randomInt(0, 10000)).padStart(4, "0");
// }

// sendCode.post("/", async (req, res) => {
//   try {
//     const { userId, email } = req.body;

//     if (!userId || !email) {
//       return res.status(400).json({ success: false, error: "Missing required fields." });
//     }

//     const user = await User.findOne({ where: { userId, email } });
//     if (!user) return res.status(404).json({ success: false, error: "Invalid userId or email" });

//     const key = email.toLowerCase();
//     const existing = otpStore.get(key);
//     const now = Date.now();
//     const WAIT = 2 * 60 * 1000; // 2 min

//     if (existing && now - existing.timestamp < WAIT) {
//       const sec = Math.ceil((WAIT - (now - existing.timestamp)) / 1000);
//       return res.status(429).json({ success: false, error: `Wait ${sec} sec to resend OTP` });
//     }

//     const code = generateOtp();
//     otpStore.set(key, { code, timestamp: now });

//     await redis.set(key, code, "EX", 5 * 60);
//     // Set rate key for 2 minutes
//     await redis.set(rateKey, "1", "EX", 2 * 60);

//     // Send OTP asynchronously (non-blocking)
//     (async () => {
//       try {
//         const transporter = createTransporter();
//         await transporter.sendMail({
//           from: `"Deepanshu" <${process.env.EMAIL_USER}>`,
//           to: email,
//           subject: "OTP Verification",
//           html: buildEmailHtml({ name: user.userId, code }),
//         });
//       } catch (err) {
//         console.error("Email error:", err);
//       }
//     })();

//     return res.status(200).json({ success: true, message: "OTP sent successfully" });

//   } catch (err) {
//     console.error("OTP Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// export default sendCode;



import { Router } from "express";
import crypto from "crypto";
import { buildEmailHtml } from "./sendEmailHtml.js";
import { createTransporter } from "./nodemailer.js";
import User from "../../Modal/User.modal.js";
import redis from "../../../config/redisClient.js";

const sendCode = Router();

function generateOtp() {
  return String(crypto.randomInt(0, 10000)).padStart(4, "0");
}

sendCode.post("/", async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email)
      return res.status(400).json({ success: false, error: "Missing fields" });

    const user = await User.findOne({ where: { userId, email } });
    if (!user)
      return res.status(404).json({ success: false, error: "Invalid userId or email" });

    const key = `otp:${email.toLowerCase()}`;
    const otp = generateOtp();

    await redis.del(key);
    const isSet = await redis.set(key, otp, "EX", 300);
    console.log("Redis SET result:", isSet);

    (async () => {
      try {
        const transporter = createTransporter();
        await transporter.sendMail({
          to: email,
          from: `"YourApp" <${process.env.EMAIL_USER}>`,
          subject: "OTP Verification",
          html: buildEmailHtml({ name: user.userId, code: otp }),
        });
      } catch {}
    })();

    return res.status(200).json({
      success: true,
      message: "OTP sent",
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referalCode: user.referalCode,
        parent_code: user.parent_code,
      },
    });
  } catch (err) {
    console.log("OTP send error", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default sendCode;
