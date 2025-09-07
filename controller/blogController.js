import Blog from "../models/Blog.js";
import cloudinary from "../config/cloudinary.js";
import slugify from "slugify";
import { validationResult } from "express-validator";

// Helper function to delete files from Cloudinary
const deleteCloudinaryFiles = async (fileUrls) => {
  for (const url of fileUrls) {
    try {
      // Extract public ID from Cloudinary URL
      const publicId = url.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
    }
  }
};

// Create Blog
export const createBlog = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        const fileUrls = [];
        if (req.files.thumbnail) fileUrls.push(req.files.thumbnail[0].path);
        if (req.files.extraImages) {
          req.files.extraImages.forEach(file => fileUrls.push(file.path));
        }
        if (req.files.videos) {
          req.files.videos.forEach(file => fileUrls.push(file.path));
        }
        await deleteCloudinaryFiles(fileUrls);
      }
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      content,
      category,
      metaTitle,
      metaDescription,
      tags,
      published,
    } = req.body;

    // Handle file uploads - now we get Cloudinary URLs
    const thumbnail = req.files?.thumbnail?.[0]?.path;
    const extraImages = req.files?.extraImages?.map(file => file.path) || [];
    const videos = req.files?.videos?.map(file => file.path) || [];

    const blog = new Blog({
      title,
      slug: slugify(title, { lower: true, strict: true }),
      content,
      category,
      thumbnail,
      extraImages,
      videos,
      metaTitle,
      metaDescription,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      published: published === "true",
    });

    await blog.save();
    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Blogs (Admin) with pagination & filters
export const getAllBlogs = async (req, res) => {
  try {
    const { category, published, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (published !== undefined) query.published = published === "true";
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Blog.countDocuments(query);
    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Blog by Slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Blog
export const updateBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded files if validation fails
      if (req.files) {
        const fileUrls = [];
        if (req.files.thumbnail) fileUrls.push(req.files.thumbnail[0].path);
        if (req.files.extraImages) {
          req.files.extraImages.forEach(file => fileUrls.push(file.path));
        }
        if (req.files.videos) {
          req.files.videos.forEach(file => fileUrls.push(file.path));
        }
        await deleteCloudinaryFiles(fileUrls);
      }
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    const {
      title,
      content,
      category,
      metaTitle,
      metaDescription,
      tags,
      published,
    } = req.body;

    // Handle file updates
    const thumbnail = req.files?.thumbnail?.[0]?.path || blog.thumbnail;
    const extraImages = req.files?.extraImages?.map(file => file.path) || blog.extraImages;
    const videos = req.files?.videos?.map(file => file.path) || blog.videos;

    // Delete old files from Cloudinary if they were replaced
    const filesToDelete = [];
    if (req.files?.thumbnail && blog.thumbnail) filesToDelete.push(blog.thumbnail);
    if (req.files?.extraImages && blog.extraImages.length > 0) {
      filesToDelete.push(...blog.extraImages);
    }
    if (req.files?.videos && blog.videos.length > 0) {
      filesToDelete.push(...blog.videos);
    }

    // Update fields
    blog.title = title || blog.title;
    blog.slug = title ? slugify(title, { lower: true, strict: true }) : blog.slug;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    blog.thumbnail = thumbnail;
    blog.extraImages = extraImages;
    blog.videos = videos;
    blog.metaTitle = metaTitle || blog.metaTitle;
    blog.metaDescription = metaDescription || blog.metaDescription;
    blog.tags = tags ? tags.split(",").map(tag => tag.trim()) : blog.tags;
    blog.published = published !== undefined ? published === "true" : blog.published;

    await blog.save();
    
    // Delete old files from Cloudinary
    if (filesToDelete.length > 0) {
      await deleteCloudinaryFiles(filesToDelete);
    }

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // Delete files from Cloudinary
    const filesToDelete = [];
    if (blog.thumbnail) filesToDelete.push(blog.thumbnail);
    if (blog.extraImages.length > 0) filesToDelete.push(...blog.extraImages);
    if (blog.videos.length > 0) filesToDelete.push(...blog.videos);
    
    await deleteCloudinaryFiles(filesToDelete);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Publish
export const togglePublish = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    blog.published = !blog.published;
    await blog.save();
    res.status(200).json({
      success: true,
      message: `Blog ${blog.published ? "published" : "unpublished"} successfully`,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct("category");
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Tags
export const getTags = async (req, res) => {
  try {
    const tags = await Blog.distinct("tags");
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};







