import express from 'express';
import { getApiData, postData } from '../controllers/getApiData.js';
import { validateUser } from '../middlewares/index.js';
const router = express.Router();

router.route("/")
.get(validateUser, getApiData)
.post(postData);
// .delete(deleteApiData)
// .patch(updateApiData)

export default router;