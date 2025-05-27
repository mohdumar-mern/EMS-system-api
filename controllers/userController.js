import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";

import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";

// user register
export const register = expressAsyncHandler(async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check for user exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Email already in use" });
    }

    // Hash password
    const hashedPassword =await bcrypt.hash(password, 10);

    // create and save new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
    });
    const savedUser = await user.save();

    // generate Token
    const token = generateToken(savedUser._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600 * 1000, // 1 hour in ms
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Respond
    res.status(201).json({
      message: "User created successfully",
      token,
      success: true,
      user: {
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Login user

export const login = expressAsyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    }

    // generate token
    const token = generateToken(user._id);

    // set cookies
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Responsed
    // Respond
    res.json({
      message: "Logged in successfully",
      token,
      success: true,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Logout

export const logout = expressAsyncHandler(async (req, res) => {
  try {
    // clear Cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
