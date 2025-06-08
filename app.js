import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoute.js";
import userRoutes from "./routes/userRoute.js";
import departmentRoutes from "./routes/departmentRoute.js";
import employeeRoutes from "./routes/employeeRoute.js";
import salaryRoutes from "./routes/salaryRoute.js";
import leaveRoutes from "./routes/leaveRoute.js"; 
import summaryRoutes from "./routes/summaryRoutes.js"; 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // adjust to your frontend URL
  credentials: true 
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // 


// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes); 
app.use("/api/department", departmentRoutes);
app.use("/api/employee", employeeRoutes); 
app.use("/api/salary", salaryRoutes);
app.use("/api/leave", leaveRoutes); 
app.use("/api/dashboard", summaryRoutes); 

// Health Check
app.get("/", (req, res) => res.send("API is running..."));

// Start Server after DB connection
connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database", err);
  });
// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Handle other errors
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

