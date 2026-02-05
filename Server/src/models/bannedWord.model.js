const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BannedWord = sequelize.define('BannedWord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  word: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    set(value) {
      // Auto lowercase before saving
      this.setDataValue('word', value.toLowerCase());
    }
  },
}, {
  tableName: 'banned_words',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = BannedWord;
