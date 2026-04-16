import { Router } from "express";
import Courses from "../../Modal/courses.modal.js";
import User from "../../Modal/User.modal.js";
import fs from "fs";
import { uploadCourseImage } from "../../../middleware/upload.js";
import { authenticateToken } from "../../../middleware/authentication.js";

const createCourses = Router();

createCourses.post("/", authenticateToken, uploadCourseImage, async (req, res) => {
  try {
    const { course_name, description, price, duration, category_id,  } = req.body;
    const user_id = req.user.userId;

    if (!course_name || !description || !price || !duration || !category_id || !user_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }



    const priceNum = parseFloat(price);
    const durationNum = parseInt(duration);

    if (isNaN(priceNum)) return res.status(400).json({ error: "Price must be a number." });
    if (isNaN(durationNum)) return res.status(400).json({ error: "Duration must be a number." });

    // Check user exists
    const user = await User.findOne({ where: { userId: user_id } });
    if (!user) return res.status(404).json({ error: "User not found." });

    // Build public image URL
    if (!req.file) return res.status(400).json({ error: "Image file is required." });
    const filename = req.file.filename;
    const imageURL = `/upload/courses/${filename}`;


    // Create course
    const course = await Courses.create({
      course_name,
      description,
      image: imageURL,
      price: priceNum,
      duration: durationNum,
      category_id,
      userId: user_id,
    });

    res.status(200).json({
      message: "Course created successfully.",
      course,
    });

  } catch (err) {
    console.error("Error:", err);

    if (req.file) fs.unlink(req.file.path, () => { });

    res.status(500).json({ error: err.message });
  }
});

export default createCourses;
