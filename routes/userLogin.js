import express from 'express';
import { login, signUp } from '../controllers/auth.js';
const router = express.Router();

router
    .route('/')
    .get(login)
    .post(signUp);

export default router;