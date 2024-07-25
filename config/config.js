import { configDotenv } from "dotenv";
configDotenv();

export const { DATABASE_URL } = process.env;
