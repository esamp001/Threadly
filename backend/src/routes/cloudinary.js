const express = require('express');
const multer = require('multer');
const cloudinary = require('../cloudinary/setupcloud');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload route
router.post('/upload', upload.single('avatar'), async (req, res) => {
  
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
      public_id: `space-avatar-${Date.now()}`,
      folder: 'threadly/avatars'
    });

    res.json({
      status: 'success',
      message: 'Avatar uploaded successfully',
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;