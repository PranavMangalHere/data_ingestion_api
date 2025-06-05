// routes/ingestionRoutes.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Ingestion = require('../models/Ingestion');
const Batch = require('../models/Batch');
const { enqueueBatches, getOverallStatus } = require('../services/processor');

// POST /ingest
router.post('/ingest', async (req, res) => {
  const { ids, priority } = req.body;
  if (!ids || !priority) return res.status(400).json({ error: 'Missing fields' });

  const ingestion_id = uuidv4();
  const ingestion = new Ingestion({ ingestion_id, priority });
  await ingestion.save();

  // Break into batches of 3
  const batches = [];
  for (let i = 0; i < ids.length; i += 3) {
    const batch_id = uuidv4();
    const batchIds = ids.slice(i, i + 3);
    const batch = new Batch({ batch_id, ingestion_id, ids: batchIds });
    await batch.save();
    batches.push({ batch_id, ids: batchIds, priority, createdAt: ingestion.createdAt });
  }

  enqueueBatches(batches, ingestion_id, priority, ingestion.createdAt);

  res.json({ ingestion_id });
});

// GET /status/:ingestion_id
router.get('/status/:id', async (req, res) => {
  const ingestion_id = req.params.id;
  const ingestion = await Ingestion.findOne({ ingestion_id });
  if (!ingestion) return res.status(404).json({ error: 'Not found' });

  const batches = await Batch.find({ ingestion_id });
  const overallStatus = getOverallStatus(batches);

  res.json({
    ingestion_id,
    status: overallStatus,
    batches: batches.map(b => ({
      batch_id: b.batch_id,
      ids: b.ids,
      status: b.status,
    })),
  });
});

module.exports = router;
