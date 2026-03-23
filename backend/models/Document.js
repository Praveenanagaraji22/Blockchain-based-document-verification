const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  hash:     { type: String, required: true },
  txHash:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
