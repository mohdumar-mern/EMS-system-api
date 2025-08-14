import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import { generateToken } from "../utils/generateToken.js";

// ✅ Admin Register
export const adminRegister = expressAsyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, error: "Email already in use" });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, error: "No profile image uploaded" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const fileUrl = req.file?.path || req.file?.url || "";
  const public_id = req.file?.public_id || req.file?.filename || "";

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role: role || "admin",
    profile: { url: fileUrl, public_id },
  });

  const savedUser = await user.save();
  const token = generateToken(savedUser._id);

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    token,
    user: {
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      profile: savedUser.profile,
    },
  });
});

// ✅ Admin Login
export const adminLogin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, error: "Invalid email or password" });
  }

  const token = generateToken(user._id);

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
});

// ✅ Admin Logout
export const adminLogout = expressAsyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// ✅ Get Admin Profile
export const getAdminProfile = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  res.status(200).json({ success: true, user });
});

// ✅ Admin Forgot/Reset Password
export const adminForgotPassword = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, error: "Old password is incorrect" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Password updated successfully" });
});
