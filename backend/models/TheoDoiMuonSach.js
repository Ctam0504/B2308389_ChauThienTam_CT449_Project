const mongoose = require('mongoose');

const theoDoiMuonSachSchema = new mongoose.Schema({
  MaDocGia: { type: String, required: true },
  MaSach: { type: String, required: true },
  NgayMuon: { type: Date, required: true },
  NgayTra: { type: Date },
  DaTra: { type: Boolean, default: false },
  DaDuyet: { type: Boolean, default: false } // <-- thêm trạng thái phê duyệt
}, { timestamps: true });

module.exports = mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema);
