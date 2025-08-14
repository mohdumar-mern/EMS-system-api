import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "EMS/uploads",
    allowed_formats: ["jpg", "png", "pdf", "docx", "jpeg"],
  },
});

// Wrap multer's fileFilter for debugging
const fileFilter = (req, file, cb) => {
  cb(null, true); // Accept file
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter,
});

