const Redis = require('ioredis');
const RedisMock = require('ioredis-mock');
require('dotenv').config();

const useMock = process.env.USE_MOCK_REDIS === 'true' || (!process.env.REDIS_HOST && !process.env.REDIS_URL);

let redis;

if (!useMock) {
  let redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    redisUrl = redisUrl.replace(/^["']|["']$/g, '').trim();
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    });
  } else {
    let host = (process.env.REDIS_HOST || 'localhost').replace(/^["']|["']$/g, '').trim();
    // Strip protocol if user accidentally pasted https:// or redis://
    host = host.replace(/^(https?:\/\/|rediss?:\/\/)/, '');
    // Strip trailing slash or path or port
    host = host.split('/')[0].split(':')[0];

    const rawPort = String(process.env.REDIS_PORT || '6379').replace(/^["']|["']$/g, '').trim();
    const port = parseInt(rawPort, 10) || 6379;

    let password = process.env.REDIS_PASSWORD || process.env.REDIS_PASS || undefined;
    if (password) {
      password = password.replace(/^["']|["']$/g, '').trim();
    }

    const isUpstash = host.includes('upstash.io');
    const useTls = process.env.REDIS_TLS === 'true' || isUpstash;

    console.log(`Connecting to Redis host: ${host}:${port} (TLS: ${useTls ? 'enabled' : 'disabled'})`);

    redis = new Redis({
      host,
      port,
      password,
      tls: useTls ? { rejectUnauthorized: false } : undefined,
      maxRetriesPerRequest: null,
      connectTimeout: 10000,
    });
  }

  redis.on('error', (err) => {
    console.error('Redis TCP Error:', err.message);
  });
} else {
  redis = new RedisMock();
}

console.log(`⚡ Redis Client Initialized (${redis instanceof RedisMock ? 'In-Memory Mock Engine' : 'Real Redis Server'})`);

module.exports = redis;
