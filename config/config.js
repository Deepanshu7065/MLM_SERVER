// config/config.js

import dotenv from "dotenv";
dotenv.config({ path: ".env.production" });

export default {
    development: {
        username: process.env.PGUSER,
        password: String(process.env.PGPASSWORD),
        database: process.env.PGDATABASE,
        host: process.env.PGHOST,
        dialect: "postgres",
    },
};
