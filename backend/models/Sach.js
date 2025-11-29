const mongoose = require('mongoose');

const SachSchema = new mongoose.Schema({
  MaSach: { type: String, required: true, unique: true },
  TenSach: { type: String, required: true },
  DonGia: { type: Number, default: 0 },
  SoQuyen: { type: Number, default: 0 },
  NamXuatBan: { type: Number },
  MaNXB: { type: mongoose.Schema.Types.ObjectId, ref: 'NXB' },
  NguonGoc_TacGia: { type: String },
  Anh: { type: String }  // ← Lưu đường dẫn ảnh
});

module.exports = mongoose.model('Sach', SachSchema);
