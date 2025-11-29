const express = require('express');
const router = express.Router();
const NhaXuatBan = require('../models/NhaXuatBan');

// GET all
router.get('/', async (req, res) => {
  try {
    const nxbs = await NhaXuatBan.find();
    res.json(nxbs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lấy NXB thất bại' });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const nxb = await NhaXuatBan.findById(req.params.id);
    if (!nxb) return res.status(404).json({ error: 'NXB không tồn tại' });
    res.json(nxb);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lấy NXB thất bại' });
  }
});

// POST
router.post('/', async (req, res) => {
  try {
    const nxb = new NhaXuatBan(req.body);
    await nxb.save();
    res.json({ message: 'Thêm NXB thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Thêm NXB thất bại' });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  try {
    const nxb = await NhaXuatBan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!nxb) return res.status(404).json({ error: 'NXB không tồn tại' });
    res.json({ message: 'Cập nhật thành công', nxb });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cập nhật thất bại' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const nxb = await NhaXuatBan.findByIdAndDelete(req.params.id);
    if (!nxb) return res.status(404).json({ error: 'NXB không tồn tại' });
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Xóa NXB thất bại' });
  }
});

module.exports = router;
