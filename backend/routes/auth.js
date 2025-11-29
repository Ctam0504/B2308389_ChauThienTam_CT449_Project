const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const DocGia = require('../models/DocGia');
const Admin = require('../models/Admin');
const NhanVien = require('../models/NhanVien');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '1h';

// ===================== LOGIN =====================
router.post('/login', async (req, res) => {
  try {
    const { Username, Password } = req.body;
    if (!Username || !Password) return res.status(400).json({ message: 'Thiếu Username hoặc Password!' });

    // Tìm Admin -> Nhân viên -> Độc giả
    let user = await Admin.findOne({ Username });
    let role = 'admin';

    if (!user) {
      user = await NhanVien.findOne({ Username });
      role = 'nhanvien';
    }
    if (!user) {
      user = await DocGia.findOne({ Username });
      role = 'docgia';
    }
    if (!user) return res.status(400).json({ message: 'Sai tài khoản!' });

    if (!user.Password) return res.status(400).json({ message: 'Tài khoản chưa có mật khẩu, liên hệ admin' });

    const ok = await bcrypt.compare(Password, user.Password);
    if (!ok) return res.status(400).json({ message: 'Sai mật khẩu!' });

    // Tạo JWT
    const token = jwt.sign(
      { userId: user._id, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Đăng nhập thành công!',
      role,
      userId: user._id,
      token
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server lỗi!' });
  }
});

// ===================== REGISTER ĐỘC GIẢ =====================
router.post('/register', async (req, res) => {
  try {
    const { Username, Password, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai } = req.body;

    if (!Username || !Password) return res.status(400).json({ message: 'Thiếu Username hoặc Password!' });

    // Kiểm tra username tồn tại
    const exists = await DocGia.findOne({ Username });
    if (exists) return res.status(400).json({ message: 'Username đã tồn tại!' });

    // Sinh MaDocGia tự động
    const MaDocGia = 'DG' + crypto.randomBytes(3).toString('hex').toUpperCase();

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);

    const newDocGia = new DocGia({
      MaDocGia,
      HoLot,
      Ten,
      NgaySinh,
      Phai,
      DiaChi,
      DienThoai,
      Username,
      Password: hashedPassword
    });

    await newDocGia.save();

    // Tạo JWT
    const token = jwt.sign(
      { userId: newDocGia._id, role: 'docgia' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Đăng ký độc giả thành công!',
      MaDocGia,
      userId: newDocGia._id,
      token
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server lỗi!', errors: err.errors || null });
  }
});

// ===================== EXPORT ROUTER =====================
module.exports = router; // ❌ Chỉ export router
