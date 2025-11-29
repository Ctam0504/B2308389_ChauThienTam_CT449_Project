const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  Username: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Role: { type: String, default: 'admin' }
});

module.exports = mongoose.model('Admin', adminSchema);
