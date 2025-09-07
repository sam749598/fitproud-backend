import express from "express";
import {body} from "express-validator";
import { createBlog, deleteBlog, getAllBlogs, getBlogBySlug, getCategories, getTags, togglePublish, updateBlog } from "../controller/blogController.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
const router = express.Router();

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blogs', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'gif', 'mp4', 'mov', 'avi'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional: resize images
  },
});

// const upload = multer({ 
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   },
//   fileFilter: function(req, file, cb) {
//     const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
//     const extname = allowedTypes.test(file.originalname.toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);
    
//     if(mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error("Invalid file type. Only images and videos are allowed"));
//     }
//   }
// });

// Custom sanitizer to convert string to boolean

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    // Temporarily accept all file types to test
    cb(null, true);
  }
});




const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    // Trim whitespace and convert to lowercase
    const trimmedValue = value.trim().toLowerCase();
    return trimmedValue === 'true';
  }
  return value;
};

// Validation for creating blog
const blogValidation = [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body('thumbnail').optional(),
    body('metaTitle').optional(),
    body('metaDescription').optional(),
    body('tags').optional(),
    body('published').optional().customSanitizer(toBoolean).isBoolean().withMessage('Published must be a boolean')
];

// Validation for updating blogs
const blogUpdateValidation = [
  body('title').optional(),
  body('content').optional(),
  body('category').optional(),
  body('thumbnail').optional(),
  body('metaTitle').optional(),
  body('metaDescription').optional(),
  body('tags').optional(),
  body('published').optional().customSanitizer(toBoolean).isBoolean().withMessage('Published must be a boolean')
];

// Create a new blog
router.post("/create", 
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'extraImages', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]),
  blogValidation,
  createBlog
);

// Get all blogs with pagination & filters
router.get("/", getAllBlogs);

// Get all categories
router.get("/categories", getCategories);

// Get all tags
router.get("/tags", getTags);

// Get single blog by slug
router.get("/:slug", getBlogBySlug);

// Update blog by id
router.put("/:id", 
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'extraImages', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]),
  blogUpdateValidation,
  updateBlog
);

// Delete a blog by id
router.delete("/:id", deleteBlog);

// Toggle publish status by id
router.patch("/:id/publish", togglePublish);




// Add this route for uploading files from Jodit editor
router.post("/upload-file", upload.single('file'), async (req, res) => {
  try {
    // console.log("File upload request received");
    // console.log("Request file:", req.file);
    
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    // Return the Cloudinary URL
    console.log("File uploaded successfully, URL:", req.file.path);
    res.status(200).json({ 
      success: true, 
      url: req.file.path,
      message: "File uploaded successfully"
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});




export default router;



















