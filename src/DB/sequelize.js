import { Sequelize } from "sequelize";

// Sirf DATABASE_URL ka istemal karein
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  // Production/Supabase ke liye SSL zaroori hai
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;