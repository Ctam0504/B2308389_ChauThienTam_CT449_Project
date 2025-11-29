const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================== MONGODB =====================
mongoose.connect('mongodb://127.0.0.1:27017/quanlysach', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// ===================== MODELS =====================
const Admin = require('./models/Admin');

// ===================== TẠO ADMIN MẶC ĐỊNH =====================
async function createDefaultAdmin() {
  try {
    const exists = await Admin.findOne({ Username: 'admin' });
    if (exists) return;

    const hashed = await bcrypt.hash('admin123', 10);
    const newAdmin = new Admin({ Username: 'admin', Password: hashed });

    await newAdmin.save();
    console.log('=== Admin mặc định đã được tạo: admin / admin123 ===');
  } catch (err) {
    console.error('Tạo admin mặc định thất bại:', err);
  }
}
createDefaultAdmin();

// ===================== PHỤC VỤ UPLOADS =====================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// serve tất cả file trong /uploads qua route /uploads
app.use('/uploads', express.static(uploadDir));

// ===================== IMPORT ROUTES =====================
const authRouter = require('./routes/auth');
const docgiaRouter = require('./routes/docgia');
const sachRouter = require('./routes/sach');
const nxbRouter = require('./routes/nhaxuatban');
const theodoimuonRouter = require('./routes/theodoimuonsach');
const nhanvienRouter = require('./routes/nhanvien');

// ===================== MOUNT ROUTES =====================
app.use('/api/auth', authRouter);
app.use('/api/docgia', docgiaRouter);
app.use('/api/sach', sachRouter);
app.use('/api/nhaxuatban', nxbRouter);
app.use('/api/theodoimuonsach', theodoimuonRouter);
app.use('/api/nhanvien', nhanvienRouter);

// ===================== PHỤC VỤ FRONTEND =====================
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ===================== XỬ LÝ 404 CHO API =====================
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// ===================== START SERVER =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
