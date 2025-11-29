const mongoose = require('mongoose');

const docGiaSchema = new mongoose.Schema({
  MaDocGia: { type: String, required: true, unique: true },
  HoLot: { type: String },
  Ten: { type: String },
  NgaySinh: { type: Date },
  Phai: { type: String },
  DiaChi: { type: String },
  DienThoai: { type: String },
  Username: { type: String, unique: true },  // dùng để login
  Password: { type: String }                // hashed password
});

module.exports = mongoose.model('DocGia', docGiaSchema);
