import express from "express";
import {
  registerUser,
  loginUser,
  registerAgent,
  loginAgent,
  getMe
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/register-agent", registerAgent);

router.post("/login-agent", loginAgent);

router.get("/me", authMiddleware, getMe);

export default router;