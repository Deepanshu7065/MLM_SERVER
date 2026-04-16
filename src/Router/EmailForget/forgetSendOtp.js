
// import { Router } from "express";
// import User from "../../Modal/User.modal.js";
// import { buildEmailHtml } from "../EmailVerify/sendEmailHtml.js";
// import { createTransporter } from "../EmailVerify/nodemailer.js";
// import crypto from "crypto";


// const forgetSendOtp = Router();

// export const otpStore = new Map();

// function generateOtp() {
//     const num = crypto.randomInt(0, 10000);
//     return String(num).padStart(4, "0");
// }


// forgetSendOtp.post("/", async (req, res) => {
//     try {
//         const { email, userId } = req.body
//         const user = await User.findOne({ where: { userId, email } })
//         if (!user) {
//             return res.status(404).json({ error: "User not found" })
//         }

//         const otp = generateOtp();
//         const html = buildEmailHtml({ name: user.name, code: otp });

//         const transporter = createTransporter()

//         const mailOptions = {
//             from: `Deepanshu Sender <${process.env.EMAIL_USER}>`,
//             to: user.email,
//             subject: "OTP Verification",
//             html,
//         };

//         await transporter.sendMail(mailOptions);

//         otpStore.set(email,
//             {
//                 otp,
//                 expiresAt: Date.now() + 5 * 60 * 1000
//             });

//         res.status(200).json({ message: "OTP sent successfully", success: true });

//     } catch (error) {
//         console.error("Error sending OTP:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// })

// export default forgetSendOtp


// import { Router } from "express";
// import User from "../../Modal/User.modal.js";
// import crypto from "crypto";
// import { buildEmailHtml } from "../EmailVerify/sendEmailHtml.js";
// import { createTransporter } from "../EmailVerify/nodemailer.js";

// // Define and export otpStore here so it can be imported by verifyForgetOtp.js
// export const otpStore = new Map(); 

// const forgetSendOtp = Router();

// function generateOtp() {
//     return String(crypto.randomInt(0, 10000)).padStart(4, "0");
// }

// forgetSendOtp.post("/", async (req, res) => {
//     try {
//         const { email, userId } = req.body;

//         const user = await User.findOne({ where: { userId, email } });
//         if (!user) return res.status(404).json({ success: false, error: "User not found" });

//         const key = email.toLowerCase();
//         const otp = generateOtp();

//         // Store the new OTP and its expiration time
//         otpStore.set(key, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

//         // Async mail send
//         (async () => {
//             try {
//                 const transporter = createTransporter();
//                 await transporter.sendMail({
//                     from: `"Deepanshu" <${process.env.EMAIL_USER}>`,
//                     to: email,
//                     subject: "Reset Password OTP",
//                     html: buildEmailHtml({ name: user.userId, code: otp }),
//                 });
//             } catch (err) {
//                 console.error("Email error:", err);
//             }
//         })();

//         res.status(200).json({ success: true, message: "OTP sent successfully" });

//     } catch (error) {
//         console.error("Forget OTP Error:", error);
//         res.status(500).json({ success: false, error: "Internal Server Error" });
//     }
// });

// export default forgetSendOtp;

import { Router } from "express";
import crypto from "crypto";
import redis from "../../../config/redisClient.js";
import User from "../../Modal/User.modal.js";
import { buildEmailHtml } from "../EmailVerify/sendEmailHtml.js";
import { createTransporter } from "../EmailVerify/nodemailer.js";

const forgetSendOtp = Router();

function generateOtp() {
    return String(crypto.randomInt(0, 10000)).padStart(4, "0");
}

forgetSendOtp.post("/", async (req, res) => {
    try {
        const { email, userId } = req.body;
        if (!email || !userId) return res.status(400).json({ success: false, error: "Missing fields" });

        const user = await User.findOne({ where: { userId, email } });
        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        const key = `otp:forget:${email.toLowerCase()}`;
        const otp = generateOtp();

        await redis.del(key);
        await redis.set(key, otp, "EX", 300);

        (async () => {
            try {
                const transporter = createTransporter();
                await transporter.sendMail({
                    to: email,
                    subject: "Reset Password OTP",
                    from: `"YourApp" <${process.env.EMAIL_USER}>`,
                    html: buildEmailHtml({ name: user.userId, code: otp }),
                });
            } catch { }
        })();

        return res.json({ success: true, message: "OTP sent" });
    } catch {
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default forgetSendOtp;
