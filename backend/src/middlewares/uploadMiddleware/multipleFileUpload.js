const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { slugify } = require('transliteration');

const fileFilter = require('./utils/LocalfileFilter');

const multipleFileUpload = ({
  entity,
  fileType = 'default',
  maxFiles = 10,
  allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.txt']
}) => {
  // Ensure upload directory exists
  const uploadDir = `src/public/uploads/${entity}`;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  var diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      try {
        // fetching the file extension of the uploaded file
        let fileExtension = path.extname(file.originalname);
        let uniqueFileID = Math.random().toString(36).slice(2, 7); // generates unique ID of length 5
        let timestamp = Date.now();

        let originalname = slugify(file.originalname.split('.')[0].toLocaleLowerCase()); // convert any language to English characters
        let _fileName = `${originalname}-${timestamp}-${uniqueFileID}${fileExtension}`;

        cb(null, _fileName);
      } catch (error) {
        console.error('Error in filename generation:', error);
        cb(error);
      }
    },
  });

  // Custom file filter for allowed extensions
  const customFileFilter = (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${fileExtension} not allowed. Allowed types: ${allowedExtensions.join(', ')}`), false);
    }
  };

  const multerStorage = multer({ 
    storage: diskStorage, 
    fileFilter: customFileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per file
      files: maxFiles
    }
  }).array('attachments', maxFiles);

  return multerStorage;
};

module.exports = multipleFileUpload;
