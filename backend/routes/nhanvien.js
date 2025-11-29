const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const NhanVien = require('../models/NhanVien');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// ===================== MIDDLEWARE JWT =====================
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role; // có thể dùng để phân quyền
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
  }
};

// ===================== ROUTES =====================

// Lấy danh sách tất cả nhân viên
router.get('/', authMiddleware, async (req, res) => {
  try {
    const nhanviens = await NhanVien.find({}, '-Password');
    res.json(nhanviens);
  } catch (err) {
    console.error('GET /nhanvien ERROR:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách', errors: err.errors || null });
  }
});

// Thêm nhân viên mới
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { Username, Password, MSNV, HoTenNV, Chucvu, DiaChi, SoDienThoai } = req.body;

    if (!Username || !Password) return res.status(400).json({ message: 'Thiếu Username hoặc Password!' });

    const exists = await NhanVien.findOne({ Username });
    if (exists) return res.status(400).json({ message: 'Username đã tồn tại!' });

    const hashed = await bcrypt.hash(Password, 10);
    const finalMSNV = MSNV || ('NV' + crypto.randomBytes(3).toString('hex'));

    const newNhanVien = new NhanVien({
      Username,
      Password: hashed,
      MSNV: finalMSNV,
      HoTenNV: HoTenNV || '',
      Chucvu: Chucvu || '',
      DiaChi: DiaChi || '',
      SoDienThoai: SoDienThoai || ''
    });

    await newNhanVien.save();
    res.json({ message: 'Thêm nhân viên thành công', _id: newNhanVien._id });
  } catch (err) {
    console.error('POST /nhanvien ERROR:', err);
    res.status(500).json({ message: 'Lỗi server khi thêm nhân viên', errors: err.errors || null });
  }
});

// Cập nhật nhân viên
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = { ...req.body };

    delete updateData.Username;
    delete updateData.MSNV;

    if (updateData.Password && updateData.Password.trim() !== "") {
      updateData.Password = await bcrypt.hash(updateData.Password, 10);
    } else {
      delete updateData.Password;
    }

    const updated = await NhanVien.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });

    res.json({ message: 'Cập nhật nhân viên thành công', nhanvien: updated });
  } catch (err) {
    console.error('PUT /nhanvien/:id ERROR:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật nhân viên', errors: err.errors || null });
  }
});

// Xóa nhân viên
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await NhanVien.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy nhân viên để xóa' });

    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (err) {
    console.error('DELETE /nhanvien/:id ERROR:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa nhân viên', errors: err.errors || null });
  }
});

// Lấy thông tin nhân viên hiện tại
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const nv = await NhanVien.findById(req.userId).select('-Password');
    if (!nv) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });

    res.json(nv);
  } catch (err) {
    console.error('GET /nhanvien/me ERROR:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin nhân viên', errors: err.errors || null });
  }
});

// Cập nhật thông tin nhân viên hiện tại
router.put('/me', authMiddleware, async (req, res) => {
  try {
    let updateData = { ...req.body };

    delete updateData.Username;
    delete updateData.MSNV;

    if (updateData.Password && updateData.Password.trim() !== "") {
      updateData.Password = await bcrypt.hash(updateData.Password, 10);
    } else {
      delete updateData.Password;
    }

    const updated = await NhanVien.findByIdAndUpdate(req.userId, updateData, { new: true, runValidators: true }).select('-Password');

    res.json({ message: 'Cập nhật thông tin thành công', nhanvien: updated });
  } catch (err) {
    console.error('PUT /nhanvien/me ERROR:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin', errors: err.errors || null });
  }
});

// ===================== EXPORT ROUTER =====================
module.exports = router; // chỉ export router
