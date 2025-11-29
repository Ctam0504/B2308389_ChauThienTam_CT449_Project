const mongoose = require('mongoose');

const nhaXuatBanSchema = new mongoose.Schema({
  MaNXB: { type: String, required: true, unique: true },
  TenNXB: { type: String },
  DiaChi: { type: String }
});

module.exports = mongoose.model('NhaXuatBan', nhaXuatBanSchema);
