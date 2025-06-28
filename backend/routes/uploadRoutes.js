const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multipleFileUpload = require('../src/middlewares/uploadMiddleware/multipleFileUpload');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware
router.use(protect);

// Upload multiple files for purchase requisition
router.post('/purchase-requisition/attachments', (req, res) => {
  const uploadMiddleware = multipleFileUpload({
    entity: 'purchase-requisition',
    maxFiles: 10,
    allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.txt']
  });

  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload failed',
        error: err.message
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Process uploaded files
    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadDate: new Date().toISOString()
    }));

    console.log('✅ Files uploaded successfully:', uploadedFiles.map(f => f.originalName));

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles
    });
  });
});

// Download attachment endpoint
router.get('/purchase-requisition/attachments/:filename', protect, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../src/public/uploads/purchase-requisition', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  // Send file
  res.download(filePath, (err) => {
    if (err) {
      console.error('File download error:', err);
      res.status(500).json({
        success: false,
        message: 'File download failed'
      });
    }
  });
});

module.exports = router;
