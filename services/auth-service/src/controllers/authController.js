import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import generateToken from "../utils/generateToken.js";


// ================= USER REGISTER =================

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username=$1 OR email=$2",
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        msg: "Username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users(username,email,password) VALUES($1,$2,$3)",
      [username, email, hashedPassword]
    );

    res.status(201).json({
      msg: "User registered successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};


// ================= USER LOGIN =================

export const loginUser = async (req, res) => {
  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        msg: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        msg: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    res.json({
      token,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};


// ================= AGENT REGISTER =================

export const registerAgent = async (req, res) => {
  try {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    const existingAgent = await pool.query(
      "SELECT * FROM agents WHERE username=$1 OR email=$2",
      [username, email]
    );

    if (existingAgent.rows.length > 0) {
      return res.status(400).json({
        msg: "Username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO agents(username,email,password) VALUES($1,$2,$3)",
      [username, email, hashedPassword]
    );

    res.status(201).json({
      msg: "Agent registered successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};


// ================= AGENT LOGIN =================

export const loginAgent = async (req, res) => {
  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    const result = await pool.query(
      "SELECT * FROM agents WHERE username=$1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        msg: "Invalid credentials",
      });
    }

    const agent = result.rows[0];

    const match = await bcrypt.compare(
      password,
      agent.password
    );

    if (!match) {
      return res.status(401).json({
        msg: "Invalid credentials",
      });
    }

    const token = generateToken(agent);

    res.json({
      token,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};
export const getMe = async (req, res) => {

  try {

    res.status(200).json({
      user: req.user,
    });

  } catch (err) {

    res.status(500).json({
      msg: "Server error",
    });
  }
};