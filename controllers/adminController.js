import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import { generateToken } from "../utils/generateToken.js";

// Admin Register
export const adminRegister = expressAsyncHandler(async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already in use",
      });
    }

    // Check for uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No profile image uploaded",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get profile image data
    const fileUrl = req.file.path || req.file.url;
    const public_id = req.file.public_id || req.file.filename || null;

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "admin",
      profile: {
        url: fileUrl,
        public_id,
      },
    });

    // Save user to DB
    const savedUser = await user.save();

    // Generate JWT token
    const token = generateToken(savedUser._id);

    // Send response
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      user: {
        name: savedUser.name,
        email: savedUser.email,
        profile: savedUser.profile,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error("Admin Register Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// Admin Login
export const adminLogin = expressAsyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Respond with user info
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// Admin Logout
export const adminLogout = expressAsyncHandler(async (req, res) => {
  try {
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Get Admin Profile
export const getAdminProfile = expressAsyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// forgot password
export const adminForgotPassword = expressAsyncHandler(async (req, res) => {
  try {
    const {id} = req.params
    const {  oldPassword, newPassword } = req.body;
    console.log(req.body);

    const user = await User.findById(id);
    console.log(user)
    if (!user) {
      return res.status(404).json({ success: false, error: "User Not Found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: "Old Password Is Incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
