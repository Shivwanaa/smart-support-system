import express from "express";
import bcrypt from "bcryptjs";
import pkg from "pg";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;
const app = express();

const JWT_SECRET = process.env.JWT_SECRET;
app.use(cors());
app.use(express.json());
// PostgreSQL connection (use env variables in Docker)
const pool = new Pool({
  host: "postgres-db",
  user: "admin",
  password: "admin",
  database: "supportdb",
  port: 5432,
});
// async function initDB() {
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS users (
//       id SERIAL PRIMARY KEY,
//       username TEXT UNIQUE NOT NULL,
//       email TEXT UNIQUE NOT NULL,
//       password TEXT NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `);
// }
// initDB();
// ---------------- Register Route ----------------
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ msg: "Username or email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
app.post("/login", async (req, res) => {
  try {
    console.log("Login request body:", req.body);

    const { username, password } = req.body;
    if (!username || !password) {
      console.log("Missing fields");
      return res.status(400).json({ msg: "All fields are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    console.log("DB result:", result.rows);

    if (result.rows.length === 0) return res.status(401).json({ msg: "No username found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    console.log("Password match:", match);

    if (!match) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
    console.log("Token generated");

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
app.post("/register-agent", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    const existingAgent = await pool.query(
      "SELECT * FROM agents WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (existingAgent.rows.length > 0) {
      return res.status(400).json({ msg: "Username or email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO agents (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
app.post("/login-agent", async (req, res) => {
  try {
    console.log("Login request body:", req.body);

    const { username, password } = req.body;
    if (!username || !password) {
      console.log("Missing fields");
      return res.status(400).json({ msg: "All fields are required" });
    }

    const result = await pool.query("SELECT * FROM agents WHERE username=$1", [username]);
    console.log("DB result:", result.rows);

    if (result.rows.length === 0) return res.status(401).json({ msg: "No username found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    console.log("Password match:", match);

    if (!match) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
    console.log("Token generated");

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
//register-company
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Auth service running on port ${PORT}`);
});

//login
//ticket service
//classification service

