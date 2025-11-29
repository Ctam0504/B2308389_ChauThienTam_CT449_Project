const express = require('express');
const router = express.Router();
const Sach = require('../models/Sach');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===================== THƯ MỤC UPLOAD =====================
const uploadDir = path.join(__dirname, '../uploads/sach');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ===================== CẤU HÌNH MULTER =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ===================== GET TẤT CẢ SÁCH =====================
router.get('/', async (req, res) => {
  try {
    const saches = await Sach.find();
    res.json(saches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== THÊM SÁCH =====================
router.post('/', upload.single('Anh'), async (req, res) => {
  try {
    const { MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, NguonGoc_TacGia } = req.body;

    if (!MaSach || !TenSach)
      return res.status(400).json({ message: "Thiếu MaSach hoặc TenSach" });

    const exists = await Sach.findOne({ MaSach });
    if (exists)
      return res.status(400).json({ message: "Mã sách đã tồn tại" });

    const sach = new Sach({
      MaSach,
      TenSach,
      DonGia: DonGia ? Number(DonGia) : 0,
      SoQuyen: SoQuyen ? Number(SoQuyen) : 0,
      NamXuatBan: NamXuatBan ? Number(NamXuatBan) : null,
      MaNXB: MaNXB || "",
      NguonGoc_TacGia: NguonGoc_TacGia || "",
      Anh: req.file ? `/uploads/sach/${req.file.filename}` : ""
    });

    await sach.save();
    res.status(201).json(sach);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== CẬP NHẬT SỐ QUYỂN ATOMIC =====================
router.patch('/:MaSach/updateSoQuyen', async (req, res) => {
  const { MaSach } = req.params;
  const { delta } = req.body; // delta = +1 hoặc -1

  if (typeof delta !== 'number') {
    return res.status(400).json({ message: "delta phải là số" });
  }

  try {
    // Dùng $inc để tăng/giảm trực tiếp tại DB, tránh race condition
    const sach = await Sach.findOneAndUpdate(
      { MaSach, SoQuyen: { $gte: delta < 0 ? 1 : 0 } }, // đảm bảo không âm khi trừ
      { $inc: { SoQuyen: delta } },
      { new: true } // trả về giá trị mới
    );

    if (!sach) {
      return res.status(400).json({ message: delta < 0 ? "Sách đã hết" : "Không tìm thấy sách" });
    }

    res.json({ message: "Cập nhật số lượng thành công", SoQuyen: sach.SoQuyen });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ===================== LẤY SÁCH THEO ID HOẶC MÃ =====================
router.get('/:idOrMa', async (req, res) => {
  const { idOrMa } = req.params;
  try {
    let sach = null;
    if (/^[0-9a-fA-F]{24}$/.test(idOrMa)) {
      sach = await Sach.findById(idOrMa);
    }
    if (!sach) {
      sach = await Sach.findOne({ MaSach: idOrMa });
    }
    if (!sach) return res.status(404).json({ message: "Không tìm thấy sách" });
    res.json(sach);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== XÓA SÁCH =====================
router.delete('/:idOrMa', async (req, res) => {
  try {
    const { idOrMa } = req.params;
    let sach = null;

    // Xóa theo _id nếu hợp lệ
    if (/^[0-9a-fA-F]{24}$/.test(idOrMa)) {
      sach = await Sach.findByIdAndDelete(idOrMa);
    }
    // Nếu không tìm _id thì xóa theo MaSach
    if (!sach) {
      sach = await Sach.findOneAndDelete({ MaSach: idOrMa });
    }
    if (!sach) return res.status(404).json({ error: "Không tìm thấy sách" });

    // Xóa ảnh nếu tồn tại
    if (sach.Anh) {
      const fullPath = path.join(__dirname, "../", sach.Anh.replace(/^\//, ""));
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    res.json({ message: "Xóa sách thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ===================== CẬP NHẬT SÁCH =====================
router.put('/:idOrMa', upload.single('Anh'), async (req, res) => {
  const { idOrMa } = req.params;
  const { MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, NguonGoc_TacGia } = req.body;

  try {
    let sach = null;

    // Tìm theo _id
    if (/^[0-9a-fA-F]{24}$/.test(idOrMa)) {
      sach = await Sach.findById(idOrMa);
    }
    // Nếu không tìm thấy theo _id, tìm theo MaSach
    if (!sach) {
      sach = await Sach.findOne({ MaSach: idOrMa });
    }
    if (!sach) return res.status(404).json({ message: "Không tìm thấy sách" });

    // Cập nhật thông tin
    if (MaSach) sach.MaSach = MaSach;
    if (TenSach) sach.TenSach = TenSach;
    if (DonGia !== undefined) sach.DonGia = Number(DonGia);
    if (SoQuyen !== undefined) sach.SoQuyen = Number(SoQuyen);
    if (NamXuatBan) sach.NamXuatBan = Number(NamXuatBan);
    if (MaNXB) sach.MaNXB = MaNXB;
    if (NguonGoc_TacGia) sach.NguonGoc_TacGia = NguonGoc_TacGia;

    // Nếu có ảnh mới, xóa ảnh cũ
    if (req.file) {
      if (sach.Anh) {
        const oldPath = path.join(__dirname, "../", sach.Anh.replace(/^\//, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      sach.Anh = `/uploads/sach/${req.file.filename}`;
    }

    await sach.save();
    res.json({ message: "Cập nhật sách thành công", sach });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
