// models/Batch.js
const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batch_id: { type: String, required: true },
  ingestion_id: { type: String, required: true },
  ids: [Number],
  status: { type: String, enum: ['yet_to_start', 'triggered', 'completed'], default: 'yet_to_start' },
});

module.exports = mongoose.model('Batch', batchSchema);
