const Redis = require('ioredis');
const RedisMock = require('ioredis-mock');
require('dotenv').config();
const TaskQueueConsumer = require('./queue/taskQueue');

const useMock = process.env.USE_MOCK_REDIS === 'true' || (!process.env.REDIS_HOST && !process.env.REDIS_URL);

let redis;

if (!useMock) {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    });
  } else {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD || process.env.REDIS_PASS || undefined;
    const isUpstash = host.includes('upstash.io');
    const useTls = process.env.REDIS_TLS === 'true' || isUpstash;

    redis = new Redis({
      host,
      port,
      password,
      tls: useTls ? { rejectUnauthorized: false } : undefined,
      maxRetriesPerRequest: null,
    });
  }

  redis.on('error', (err) => {
    console.error('Worker Redis TCP Error:', err.message);
  });
} else {
  redis = new RedisMock();
}

console.log(`⚡ Worker Client Initialized (${redis instanceof RedisMock ? 'In-Memory Mock Engine' : 'Real Redis Server'})`);

const consumer = new TaskQueueConsumer(redis);
consumer.start();
