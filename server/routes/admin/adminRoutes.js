import dotenv from "dotenv";
dotenv.config();
import adminSchema from "../../models/admin/adminSchema.js";
import jwt from "jsonwebtoken";
import express from "express";
import speakeasy from "speakeasy";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Admin Register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingAdmin = await adminSchema.findOne({ email });

    if (existingAdmin) {
      return res.json({ message: "Admin already exists" });
    }

    const admin = await adminSchema.create({ email, password });

    const token = generateToken(admin._id);

    res.status(201).json({
      token,
      admin: { id: admin._id, email: admin.email },
      message: "Admin created successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin Login (Email + Password + OTP)
router.post("/login", async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const admin = await adminSchema.findOne({ email }).select("+password +authCode");

    // Step 1: check credentials
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Step 2: OTP required
    if (!otp) {
      return res.status(400).json({ message: "OTP required" });
    }

    // Step 3: verify OTP
    const verified = speakeasy.totp.verify({
      secret: admin.authCode,
      encoding: "base32",
      token: otp,
      window: 1, // allow slight clock drift
    });

    if (!verified) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Step 4: issue JWT
    const token = generateToken(admin._id);

    res.json({
      token,
      message: "Login successful",
      admin: { id: admin._id, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
