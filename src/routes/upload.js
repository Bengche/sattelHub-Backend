const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const cloudinary = require("../config/cloudinary");
const {
  uploadProductImages,
  uploadSingleImage,
  uploadBlogImage,
} = require("../middleware/upload");
const { adminOnly } = require("../middleware/admin");

// Upload product images (up to 10)
router.post("/products", adminOnly, (req, res) => {
  uploadProductImages(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded." });
    }

    // Support both multer-storage-cloudinary property conventions safely
    const images = req.files.map((file) => ({
      cloudinaryId: file.filename || file.public_id,
      url: file.path || file.secure_url,
      altText: req.body.altText || file.originalname || "",
    }));

    return res.status(200).json({ success: true, data: { images } });
  });
});

// Upload single image (avatar, general preview)
router.post("/single", adminOnly, (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded." });
    }

    return res.status(200).json({
      success: true,
      data: {
        cloudinaryId: req.file.filename || req.file.public_id,
        url: req.file.path || req.file.secure_url,
      },
    });
  });
});

// Upload blog cover image
router.post("/blog", adminOnly, (req, res) => {
  uploadBlogImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded." });
    }

    return res.status(200).json({
      success: true,
      data: {
        cloudinaryId: req.file.filename || req.file.public_id,
        url: req.file.path || req.file.secure_url,
      },
    });
  });
});

// Delete image from Cloudinary & cleanup DB
router.delete("/:cloudinaryId", adminOnly, async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.cloudinaryId);

    // Delete asset from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove reference from PostgreSQL if it exists
    await pool.query("DELETE FROM product_images WHERE cloudinary_id = $1", [
      publicId,
    ]);

    return res.status(200).json({ success: true, message: "Image deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
