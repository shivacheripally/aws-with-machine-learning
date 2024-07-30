import { configDotenv } from "dotenv";
configDotenv();

export const { DATABASE_URL, CLIENT_ID, REGION, USER_POOL_ID } = process.env;
