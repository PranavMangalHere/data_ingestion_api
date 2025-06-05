// models/Ingestion.js
const mongoose = require('mongoose');

const ingestionSchema = new mongoose.Schema({
  ingestion_id: { type: String, required: true, unique: true },
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ingestion', ingestionSchema);
