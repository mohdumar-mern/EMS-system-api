import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";

// 🔐 Register new user
export const register = expressAsyncHandler(async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "employee",
    });

    const savedUser = await user.save();
    const token = generateToken(savedUser._id);

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// 🔓 Login user
export const login = expressAsyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, error: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });

    const passwordMatch = user && await bcrypt.compare(password, user.password);

    if (!user || !passwordMatch) {
      return res.status(400).json({ success: false, error: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// 🚪 Logout user
export const logout = expressAsyncHandler(async (req, res) => {
  try {
    // For JWT, logout is usually handled on client (by removing token)
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// 🔑 Forgot password (change password)
export const forgotPassword = expressAsyncHandler(async (req, res) => {
  try {
    const { userId, oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!userId || !oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Old password is incorrect" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, error: "Passwords do not match" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
