const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const Sach = require('../models/Sach');

// ================= GET phiếu mượn của một độc giả =================
router.get('/', async (req, res) => {
  try {
    const { MaDocGia } = req.query;
    if (!MaDocGia) return res.status(400).json({ message: "MaDocGia bắt buộc" });

    const list = await TheoDoiMuonSach.find({ MaDocGia, DaTra: false }).lean();
    const result = list.map(td => ({
      _id: td._id,
      MaDocGia: td.MaDocGia,
      MaSach: td.MaSach ? String(td.MaSach) : null,
      NgayMuon: td.NgayMuon ? td.NgayMuon.toISOString() : null,
      NgayTra: td.NgayTra ? td.NgayTra.toISOString() : null,
      DaTra: Boolean(td.DaTra),
      DaDuyet: Boolean(td.DaDuyet || false)
    }));

    res.json(result);
  } catch (err) {
    console.error('Lỗi GET phiếu mượn:', err);
    res.status(500).json({ message: 'Lấy phiếu mượn thất bại' });
  }
});

// ================= POST tạo phiếu mượn mới =================
router.post('/', async (req, res) => {
  const { MaDocGia, MaSach, NgayMuon, NgayTra } = req.body;
  if (!MaDocGia || !MaSach || !NgayMuon)
    return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });

  try {
    const sach = await Sach.findOne({ MaSach });
    if (!sach) return res.status(404).json({ message: 'Không tìm thấy sách' });
    if (sach.SoQuyen <= 0) return res.status(400).json({ message: 'Hết sách' });

    // Giảm số lượng sách
    sach.SoQuyen -= 1;
    await sach.save();

    const newTD = new TheoDoiMuonSach({
      MaDocGia,
      MaSach,
      NgayMuon: new Date(NgayMuon),
      NgayTra: NgayTra ? new Date(NgayTra) : null,
      DaTra: false,
      DaDuyet: false
    });

    await newTD.save();

    res.json({
      _id: newTD._id,
      MaDocGia: newTD.MaDocGia,
      MaSach: String(newTD.MaSach),
      NgayMuon: newTD.NgayMuon.toISOString(),
      NgayTra: newTD.NgayTra ? newTD.NgayTra.toISOString() : null,
      DaTra: newTD.DaTra,
      DaDuyet: newTD.DaDuyet,
      message: 'Thêm phiếu mượn thành công'
    });
  } catch (err) {
    console.error('Lỗi POST phiếu mượn:', err);
    res.status(500).json({ message: 'Thêm phiếu mượn thất bại' });
  }
});

// ================= PUT trả sách =================
router.put('/:id', async (req, res) => {
  const { DaTra, NgayTra } = req.body;
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: 'ID phiếu mượn không hợp lệ' });

  try {
    const td = await TheoDoiMuonSach.findById(id);
    if (!td) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });

    if (!td.DaTra && DaTra) {
      td.DaTra = true;
      td.NgayTra = NgayTra ? new Date(NgayTra) : new Date();

      const sach = await Sach.findOne({ MaSach: td.MaSach });
      if (sach) {
        sach.SoQuyen += 1;
        await sach.save();
      }
    }

    await td.save();

    res.json({
      _id: td._id,
      MaDocGia: td.MaDocGia,
      MaSach: String(td.MaSach),
      NgayMuon: td.NgayMuon.toISOString(),
      NgayTra: td.NgayTra ? td.NgayTra.toISOString() : null,
      DaTra: td.DaTra,
      DaDuyet: td.DaDuyet,
      message: 'Cập nhật phiếu mượn thành công'
    });
  } catch (err) {
    console.error('Lỗi PUT phiếu mượn:', err);
    res.status(500).json({ message: 'Cập nhật phiếu mượn thất bại' });
  }
});

// ================= PATCH phê duyệt phiếu mượn =================
router.patch('/:id/duyet', async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: 'ID phiếu mượn không hợp lệ' });

  try {
    const td = await TheoDoiMuonSach.findById(id);
    if (!td) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });

    td.DaDuyet = true;
    await td.save();

    res.json({ message: 'Phiếu mượn đã được phê duyệt', data: td });
  } catch (err) {
    console.error('Lỗi PATCH duyệt phiếu mượn:', err);
    res.status(500).json({ message: 'Phê duyệt phiếu mượn thất bại' });
  }
});

// ================= GET tất cả phiếu mượn =================
router.get('/all', async (req, res) => {
  try {
    const list = await TheoDoiMuonSach.find().lean();
    const result = list.map(td => ({
      _id: td._id,
      MaDocGia: td.MaDocGia ? String(td.MaDocGia) : null,
      MaSach: td.MaSach ? String(td.MaSach) : null,
      NgayMuon: td.NgayMuon ? td.NgayMuon.toISOString() : null,
      NgayTra: td.NgayTra ? td.NgayTra.toISOString() : null,
      DaTra: Boolean(td.DaTra),
      DaDuyet: Boolean(td.DaDuyet || false)
    }));
    res.json(result);
  } catch (err) {
    console.error('Lỗi GET tất cả phiếu mượn:', err);
    res.status(500).json({ message: 'Lấy tất cả phiếu mượn thất bại' });
  }
});

// ================= DELETE phiếu mượn =================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: 'ID phiếu mượn không hợp lệ' });

  try {
    const td = await TheoDoiMuonSach.findById(id);
    if (!td) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });

    if (!td.DaTra) {
      const sach = await Sach.findOne({ MaSach: td.MaSach });
      if (sach) {
        sach.SoQuyen += 1;
        await sach.save();
      }
    }

    await td.deleteOne();
    res.json({ message: 'Xóa phiếu mượn thành công' });
  } catch (err) {
    console.error('Lỗi DELETE phiếu mượn:', err);
    res.status(500).json({ message: 'Xóa phiếu mượn thất bại' });
  }
});

module.exports = router;
