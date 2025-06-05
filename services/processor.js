// services/processor.js
const Batch = require('../models/Batch');

const queue = [];
let isProcessing = false;

function getPriorityValue(p) {
  return p === 'HIGH' ? 1 : p === 'MEDIUM' ? 2 : 3;
}

function enqueueBatches(batches, ingestion_id, priority, createdAt) {
  batches.forEach(batch => {
    queue.push({ ...batch, ingestion_id, priority, createdAt });
  });
  queue.sort((a, b) => {
    if (getPriorityValue(a.priority) !== getPriorityValue(b.priority))
      return getPriorityValue(a.priority) - getPriorityValue(b.priority);
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  if (!isProcessing) processQueue();
}

async function processQueue() {
  isProcessing = true;
  while (queue.length > 0) {
    const batch = queue.shift();
    await Batch.updateOne({ batch_id: batch.batch_id }, { status: 'triggered' });
    console.log(`Processing batch ${batch.batch_id}...`);
    await simulateExternalAPI(batch.ids);
    await Batch.updateOne({ batch_id: batch.batch_id }, { status: 'completed' });
    await new Promise(r => setTimeout(r, 5000)); // 5 sec delay
  }
  isProcessing = false;
}

async function simulateExternalAPI(ids) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Simulated data:', ids.map(id => ({ id, data: 'processed' })));
      resolve();
    }, 2000);
  });
}

function getOverallStatus(batches) {
  const statuses = batches.map(b => b.status);
  if (statuses.every(s => s === 'yet_to_start')) return 'yet_to_start';
  if (statuses.every(s => s === 'completed')) return 'completed';
  return 'triggered';
}

module.exports = { enqueueBatches, getOverallStatus };
