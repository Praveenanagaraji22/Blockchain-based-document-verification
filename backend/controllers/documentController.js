const crypto = require('crypto');
const fs = require('fs');
const Document = require('../models/Document');
const { storeHashOnChain, verifyHashOnChain } = require('../config/blockchain');

exports.uploadDocument = async (req, res) => {
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Store hash on blockchain
    const txHash = await storeHashOnChain(hash);

    const doc = await Document.create({
      userId: req.user._id,
      filename: req.file.originalname,
      hash,
      txHash,
    });

    res.status(201).json({ message: 'Document uploaded', hash, txHash, docId: doc._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyDocument = async (req, res) => {
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const result = await verifyHashOnChain(hash);

    res.json({
      hash,
      verified: result.exists,
      uploadedBy: result.uploadedBy,
      timestamp: result.timestamp,
      message: result.exists ? '✅ Document is VERIFIED' : '❌ Document is TAMPERED or NOT FOUND',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
