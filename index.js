import express from "express";
import { apiRoute, authRoute } from "./routes/index.js";
import { sequelize } from "./config/db.js";
import bodyParser from "body-parser";
import cors from "cors";
import "./model/dataSchema.js";
import "./model/userSchema.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 7000;

app.use(express.static(path.join(__dirname, '..', 'aws-frontend', 'build')));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api", apiRoute);
app.use("/auth", authRoute);

const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true }); // Use alter: true in production, or preferably use migrations
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("An error occurred while synchronizing the models:", error);
  }
};


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'aws-frontend', 'build', 'index.html'));
});

syncModels().then(() => {
  app.listen(port, (err) => {
    if (err) {
      console.log(`Error while starting server: ${err}`);
      return;
    }
    console.log(`Server is up and running on port: ${port}`);
  });
});
