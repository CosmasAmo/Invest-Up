import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // Required for cloud-based PostgreSQL like Neon
      rejectUnauthorized: false,
    },
  },
  logging: false, // Disable logging (optional)
});

export default sequelize;
