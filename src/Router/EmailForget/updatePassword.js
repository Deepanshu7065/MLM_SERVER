
// import { Router } from "express";
// import User from "../../Modal/User.modal.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const updatePassword = Router();

// updatePassword.patch("/", async (req, res) => {
//     try {
//         const { email, confirmPassword } = req.body
//         if (!email || !confirmPassword) {
//             return res.status(400).json({ error: "Missing required fields." });
//         }

//         const user = await User.findOne({ where: { email } });

//         if (!user) {
//             return res.status(404).json({ error: "User not found." });
//         }

//         const hashedPassword = await bcrypt.hash(confirmPassword, 10);

//         user.password = hashedPassword
//         await user.save()

//         const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, { expiresIn: "2d" });

//         return res.status(200).json({
//             message: "Password updated successfully.",
//             token,
//             user: {
//                 name: user.name,
//                 email: user.email,
//                 phone: user.phone,
//                 referalCode: user.referalCode,
//                 parent_code: user.parent_code,
//                 ref_by_id: user.ref_by_id,
//                 userId: user.userId
//             },
//             success: true
//         });


//     } catch (error) {
//         console.error("Error updating password:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// })


// export default updatePassword;

import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../Modal/User.modal.js";

const updatePassword = Router();

updatePassword.patch("/", async (req, res) => {
  try {
    const { email, confirmPassword } = req.body;
    if (!email || !confirmPassword)
      return res.status(400).json({ success: false, error: "Missing fields" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    user.password = await bcrypt.hash(confirmPassword, 10);
    await user.save();

    const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, { expiresIn: "2d" });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      token,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        referalCode: user.referalCode,
        parent_code: user.parent_code,
        ref_by_id: user.ref_by_id,
        userId: user.userId,
      },
    });

  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

export default updatePassword;
