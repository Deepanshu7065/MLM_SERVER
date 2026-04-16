// import { Router } from "express";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import User from "../../Modal/User.modal.js";

// const verifyPassword = Router();

// verifyPassword.post("/", async (req, res) => {
//   try {
//     const { userId, password } = req.body;

//     if (!userId || !password) {
//       return res.status(400).json({ error: "Missing fields" });
//     }

//     const user = await User.findOne({ where: { userId } });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) {
//       return res.status(401).json({ error: "Invalid password" });
//     }

//     // ✅ JWT ONLY userId
//     const token = jwt.sign(
//       { userId: user.userId },
//       process.env.JWT_SECRET,
//       { expiresIn: "2d" }
//     );

//     return res.json({ token });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default verifyPassword;


import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../Modal/User.modal.js";

const verifyPassword = Router();

verifyPassword.post("/", async (req, res) => {
  try {
    const { userId, password } = req.body;

    const user = await User.findOne({ where: { userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, userId: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default verifyPassword;
