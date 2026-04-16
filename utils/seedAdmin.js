import bcrypt from "bcryptjs";
import User from "../src/Modal/User.modal.js";

export const seedAdmin = async () => {
    try {
        const adminEmail = "admin@gmail.com";

        const existingAdmin = await User.findOne({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            console.log("✅ Admin already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        await User.create({
            name: "Deepanshu",
            email: adminEmail,
            phone: "9999999999",
            password: hashedPassword,
            role: "admin",
            userId: "ADMIN001"
        });

        console.log("🔥 Default Admin Created");
    } catch (error) {
        console.error("Admin seeding error:", error);
    }
};
