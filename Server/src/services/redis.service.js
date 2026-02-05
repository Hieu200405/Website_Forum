const { createClient } = require('redis');
const redisConfig = require('../config/redis');

class RedisService {
  constructor() {
    this.client = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port
      },
      password: redisConfig.password
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.on('connect', () => console.log('Redis Client Connected'));
    
    // Auto connect
    this.connect();
  }

  async connect() {
    try {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    } catch (err) {
        console.error('Redis Connection Failed:', err.message);
    }
  }

  async get(key) {
    try {
        if (!this.client.isOpen) return null;
        return await this.client.get(key);
    } catch (err) {
        console.error(`Redis Get Error (${key}):`, err.message);
        return null;
    }
  }

  async set(key, value, ttlSeconds) {
    try {
        if (!this.client.isOpen) return;
        await this.client.set(key, value, {
            EX: ttlSeconds
        });
    } catch (err) {
        console.error(`Redis Set Error (${key}):`, err.message);
    }
  }

  /**
   * Increment key value atomically. Set TTL if key is new.
   * @param {string} key 
   * @param {number} ttlSeconds 
   * @returns {Promise<number>} new value
   */
  async increment(key, ttlSeconds) {
    try {
        if (!this.client.isOpen) return 0;
        
        const newValue = await this.client.incr(key);
        // Nếu mới tạo (value = 1), set expire
        if (newValue === 1) {
            await this.client.expire(key, ttlSeconds);
        }
        return newValue;
    } catch (err) {
        console.error(`Redis Incr Error (${key}):`, err.message);
        return 0;
    }
  }

  /**
   * Delete keys matching pattern
   * Warning: KEYS is expensive in production. Use SCAN for safer iteration.
   * For this drafted scope, KEYS or scanIterator is fine.
   */
  async delPattern(pattern) {
    try {
        if (!this.client.isOpen) return;
        
        // Use scanIterator for better performance/safety than KEYS
        for await (const key of this.client.scanIterator({ MATCH: pattern })) {
            await this.client.del(key);
        }
        console.log(`Cleared cache pattern: ${pattern}`);
    } catch (err) {
        console.error(`Redis Delete Pattern Error (${pattern}):`, err.message);
    }
  }
}

// Singleton
module.exports = new RedisService();
