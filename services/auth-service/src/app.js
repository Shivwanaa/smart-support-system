import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Auth service running"
  });
});

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

export default app;