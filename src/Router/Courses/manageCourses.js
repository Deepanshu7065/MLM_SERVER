import { Router } from "express";
import Courses from "../../Modal/courses.modal.js";
import { uploadCourseImage } from "../../../middleware/upload.js";

import fs from 'fs';

const manageCourses = Router();

manageCourses.put("/:id", uploadCourseImage, async (req, res) => {
    try {
        const courseId = req.params.id;
        const updates = req.body;
        
        const course = await Courses.findByPk(courseId);
        
        if (!course) {
            return res.status(404).json({ error: "Course not found." });
        }

        let oldImagePath = course.image;
        let newImagePath = updates.image || oldImagePath;

        if (req.file) {
            newImagePath = req.file.path;
            updates.image = newImagePath;
            
            if (oldImagePath && fs.existsSync(oldImagePath)) {
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Error deleting old file:", err);
                });
            }
        }
        
        await course.update(updates);

        res.status(200).json({ 
            message: "Course updated successfully!",
            course 
        });

    } catch (err) {
        console.error("Error:", err);
        if (req.file) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting file:", unlinkErr);
            });
        }
        res.status(500).json({ error: err.message });
    }
});

manageCourses.delete("/:id", async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Courses.findByPk(courseId);

        if (!course) {
            return res.status(404).json({ error: "Course not found." });
        }

        const imagePath = course.image;

        await course.destroy();

        if (imagePath && fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Error deleting image file:", err);
            });
        }

        res.status(200).json({ message: "Course deleted successfully!" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default manageCourses;