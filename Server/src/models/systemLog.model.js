const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemLog = sequelize.define('SystemLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Có thể log hành động của guest
    field: 'user_id'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  data: {
    type: DataTypes.TEXT, // Lưu JSON string hoặc text chi tiết
    allowNull: true,
  },
  level: {
    type: DataTypes.STRING(20), // INFO, WARN, ERROR
    defaultValue: 'INFO',
  }
}, {
  tableName: 'system_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Log thường chỉ cần thời gian tạo
});

module.exports = SystemLog;
