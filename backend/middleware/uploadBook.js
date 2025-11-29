const multer = require('multer');
const path = require('path');

// Nơi lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/books/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// Chỉ nhận ảnh
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Chỉ hỗ trợ ảnh!'), false);
};

module.exports = multer({ storage, fileFilter });
