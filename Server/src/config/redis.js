const { createClient } = require('redis');

const redisClient = createClient({
  url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.log('Redis error:', err);
});

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
