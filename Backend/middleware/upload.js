const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination directories exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'prescriptions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prescription-${uniqueSuffix}${ext}`);
  }
});

// File filter (accept images & pdf)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|pdf/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png|webp)|application\/pdf/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP) or PDF are allowed for prescription upload!'));
  }
};

const uploadPrescription = multer({
  storage: storage,
  limits: {
    fileSize: 8 * 1024 * 1024 // 8MB limit
  },
  fileFilter: fileFilter
});

module.exports = {
  uploadPrescription
};
