import { Router } from "express";
import UserCourse from "../../Modal/UserCourse.modal.js";
import Courses from "../../Modal/courses.modal.js";

const myCoursesRouter = Router();

myCoursesRouter.get("/:userId", async (req, res) => {
  try {
    const courses = await UserCourse.findAll({
      where: { userId: req.params.userId },
      include: [{ model: Courses }],
    });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default myCoursesRouter;
