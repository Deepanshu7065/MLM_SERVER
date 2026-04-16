// // models/UserCourse.model.js
// import sequelize from "../DB/sequelize.js";
// import { DataTypes } from "sequelize";
// import User from "./User.modal.js";
// import Courses from "./courses.modal.js";

// const UserCourse = sequelize.define("user_courses", {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   user_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: "Users",
//       key: "id"
//     }
//   },
//   course_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   payment_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
// }, {
//   timestamps: true,
//   createdAt: "created_at",
//   updatedAt: "updated_at",
//   tableName: "user_courses",
// });

// UserCourse.belongsTo(User, { foreignKey: "userId" });
// UserCourse.belongsTo(Courses, { foreignKey: "course_id" });

// export default UserCourse;


// models/UserCourse.model.js
import sequelize from "../DB/sequelize.js";
import { DataTypes } from "sequelize";
import User from "./User.modal.js";
import Courses from "./courses.modal.js";

const UserCourse = sequelize.define("user_courses", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id"
    }
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  tableName: "user_courses",
});

UserCourse.belongsTo(User, { foreignKey: "userId" });
UserCourse.belongsTo(Courses, { foreignKey: "course_id" });

export default UserCourse;