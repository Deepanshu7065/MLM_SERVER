import bcrypt from "bcryptjs";
import User from "../src/Modal/User.modal.js";
import { Op } from "sequelize"; // Ye line add karein    
export const seedAdmin = async () => {
    try {
        const adminEmail = "admin@gmail.com";
        const adminID = "ADMIN001";

        // Optimize: Dono unique identifiers check karein (Email aur UserId)
        const existingAdmin = await User.findOne({
            where: {
                [Op.or]: [
                    { email: adminEmail },
                    { userId: adminID }
                ]
            }
        });

        if (existingAdmin) {
            console.log("✅ Admin already exists (Email or ID match)");
            return;
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        await User.create({
            name: "Deepanshu",
            email: adminEmail,
            phone: "7065867460",
            password: hashedPassword,
            role: "admin",
            userId: adminID
        });

        console.log("🔥 Default Admin Created Successfully");
    } catch (error) {
        // Agar sync issues ki wajah se error aaye toh crash na ho
        console.error("⚠️ Admin seeding error (Skipped):", error.name);
    }
};