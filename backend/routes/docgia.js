// routes/docgia.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const DocGia = require('../models/DocGia');

// GET tất cả độc giả
router.get('/', async (req, res) => {
  try {
    const list = await DocGia.find({}, '-Password');
    res.json(list);
  } catch (err) {
    console.error('Lỗi GET tất cả độc giả:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET độc giả theo MaDocGia hoặc _id
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    // Tìm theo MaDocGia trước, nếu không có thử theo _id
    let docGia = await DocGia.findOne({ MaDocGia: identifier }, '-Password');
    if (!docGia) {
      // kiểm tra identifier có phải ObjectId hợp lệ không
      if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
        docGia = await DocGia.findById(identifier, '-Password');
      }
    }

    if (!docGia) return res.status(404).json({ message: 'Không tìm thấy độc giả' });

    res.json(docGia);
  } catch (err) {
    console.error(`Lỗi GET độc giả identifier=${req.params.identifier}:`, err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT cập nhật độc giả theo MaDocGia hoặc _id
router.put('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const updateData = { ...req.body };

    if (updateData.Password) {
      updateData.Password = await bcrypt.hash(updateData.Password, 10);
    }

    let docGia = await DocGia.findOneAndUpdate({ MaDocGia: identifier }, updateData, { new: true, runValidators: true });
    if (!docGia && /^[0-9a-fA-F]{24}$/.test(identifier)) {
      docGia = await DocGia.findByIdAndUpdate(identifier, updateData, { new: true, runValidators: true });
    }

    if (!docGia) return res.status(404).json({ message: 'Không tìm thấy độc giả' });

    res.json({ message: 'Cập nhật thành công', docGia });
  } catch (err) {
    console.error(`Lỗi PUT độc giả identifier=${req.params.identifier}:`, err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE độc giả theo MaDocGia hoặc _id
router.delete('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    let docGia = await DocGia.findOneAndDelete({ MaDocGia: identifier });
    if (!docGia && /^[0-9a-fA-F]{24}$/.test(identifier)) {
      docGia = await DocGia.findByIdAndDelete(identifier);
    }

    if (!docGia) return res.status(404).json({ message: 'Không tìm thấy độc giả' });

    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    console.error(`Lỗi DELETE độc giả identifier=${req.params.identifier}:`, err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
