// import sequelize from "../DB/sequelize.js";
// import { DataTypes } from "sequelize";
// import User from "./User.modal.js";

// const Courses = sequelize.define("courses", {
//     id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//     },
//     course_name: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     description: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     image: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     price: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//     },
//     duration: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//     },
//     category_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//     },
//     userId: {
//         type: DataTypes.STRING,
//         allowNull: false
//     }

// }, {
//     timestamps: true,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//     tableName: "courses"
// })

// User.hasMany(Courses, { foreignKey: "userId", sourceKey: "userId" });
// Courses.belongsTo(User, { foreignKey: "userId", targetKey: "userId" });

// export default Courses


import sequelize from "../DB/sequelize.js";
import { DataTypes } from "sequelize";
import User from "./User.modal.js";

const Courses = sequelize.define("courses", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    course_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    }

}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "courses"
})

User.hasMany(Courses, { foreignKey: "userId", sourceKey: "userId" });
Courses.belongsTo(User, { foreignKey: "userId", targetKey: "userId" });

export default Courses