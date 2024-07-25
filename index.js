import express, { urlencoded } from 'express';
import { apiRoute, authRoute } from './routes/index.js';
import { connection } from './config/db.js';

const app = express();
const port = 7000;

app.use(urlencoded({extends: true}));
app.use(express.json());
app.use("/api", apiRoute);
app.use('/auth', authRoute);

app.listen(port, async (err) => {
  if (err) {
    console.log(`Error while server is up : ${err}`);
    return;
  }
  await connection();
  console.log(`Server is up and running on port: ${port}`);
});
