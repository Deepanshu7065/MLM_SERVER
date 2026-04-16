import { Router } from "express";
import Courses from "../../Modal/courses.modal.js";
import User from "../../Modal/User.modal.js";

const courses = Router();

courses.get("/", async (req, res) => {
    try {
        const coursesList = await Courses.findAll({
            include: [
                {
                  model: User,
                  attributes: ["userId", "email", "name", "phone"]
                }
              ]
        });
        res.status(200).json({ courses: coursesList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default courses;
