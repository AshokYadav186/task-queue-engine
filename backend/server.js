const express = require('express');
const cors = require('cors');
require('dotenv').config();

const redis = require('./config/redis');

// Attempt to load TaskQueueConsumer from local backend/worker or parent worker
let TaskQueueConsumer;
try {
  TaskQueueConsumer = require('./worker/queue/taskQueue');
} catch (e1) {
  try {
    TaskQueueConsumer = require('../worker/queue/taskQueue');
  } catch (e2) {
    console.warn('TaskQueueConsumer not found, skipping embedded worker:', e2.message);
  }
}

const jobRoutes = require('./routes/jobRoutes');
const metricRoutes = require('./routes/metricRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Root API status endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Distributed Task Queue & Worker Engine API',
    status: 'ONLINE',
    version: '1.4.0',
    endpoints: {
      health: '/health',
      jobs: '/api/jobs',
      metrics: '/api/metrics',
      dlqRetry: 'POST /api/jobs/dlq/retry',
      clearCompleted: 'POST /api/jobs/clear',
    },
    documentation: 'https://github.com/AshokYadav186/task-queue-engine',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Task Queue API Server', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/metrics', metricRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`⚡ Task Queue API Server running on port ${PORT}`);
  
  if (TaskQueueConsumer) {
    try {
      console.log(`⚡ Starting Worker Queue Consumer on Port ${PORT}...`);
      const consumer = new TaskQueueConsumer(redis);
      consumer.start();
    } catch (err) {
      console.error('Failed to start worker consumer:', err.message);
    }
  }
});
