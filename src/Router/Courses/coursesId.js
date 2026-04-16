
import { Router } from "express";
import Courses from "../../Modal/courses.modal.js";

const router = Router();

router.get("/:id", async (req, res) => {
    try {
        const course = await Courses.findOne({
            where: { id: req.params.id }
        });

        res.status(200).json({ course });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default router;
