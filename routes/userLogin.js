import express from "express";
import {
  registerUser,
  loginUser,
  updatePassword,
} from "../controllers/register.js";
const router = express.Router();

router.route("/login").post(loginUser);

router.route("/sign-up").post(registerUser);

router.route("/update-password").post(updatePassword);

export default router;
