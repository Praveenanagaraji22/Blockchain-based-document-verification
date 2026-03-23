const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const protect = require('../middleware/authMiddleware');
const { uploadDocument, getMyDocuments, verifyDocument } = require('../controllers/documentController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png/;
    allowed.test(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error('Only PDF/Image files allowed'));
  },
});

router.post('/upload', protect, upload.single('document'), uploadDocument);
router.post('/verify', protect, upload.single('document'), verifyDocument);
router.get('/my', protect, getMyDocuments);

module.exports = router;
