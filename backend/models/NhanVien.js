const mongoose = require('mongoose');

const NhanVienSchema = new mongoose.Schema({
  MSNV: { type: String, required: true, unique: true },
  Username: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  HoTenNV: { type: String },
  Chucvu: { type: String },
  DiaChi: { type: String },
  SoDienThoai: { type: String },
  Role: { type: String, default: 'nhanvien' } // ✅ thêm role
});

module.exports = mongoose.model('NhanVien', NhanVienSchema);
