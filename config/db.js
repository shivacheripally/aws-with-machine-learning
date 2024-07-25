import { Sequelize } from "sequelize";
import { DATABASE_URL } from "./config.js";

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres', // Specify the dialect explicitly
  logging: false // Optional: set to true if you want to log SQL queries
});

export const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to DataBase successfully.");
    // logger.info("✅ Connected to DataBase successfully.");
  } catch (error) {
    console.log(`Error while connecting to DB: ${error}`);
    // logger.error({
    //   message: error.message,
    //   stack: JSON.stringify(error.stack),
    // });
  }
};
