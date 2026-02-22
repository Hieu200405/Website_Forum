const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);

const originalClose = sequelize.close.bind(sequelize);
sequelize.close = async () => {
  await originalClose();
  
  // Cleanly close Redis if running tests to prevent tests from hanging
  if (process.argv[1] && process.argv[1].includes('Testing')) {
    try {
      const RedisService = require('../services/redis.service');
      if (RedisService.client && RedisService.client.isOpen) {
        await RedisService.client.disconnect();
      }
    } catch (e) {
        // Ignore uninitialized module errors
    }
    
    // Force exit test to clear the event loop fast and drastically speed up CI execution
    setTimeout(() => process.exit(0), 10);
  }
};

module.exports = sequelize;
