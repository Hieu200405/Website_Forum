const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Post = require('./post.model');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    }
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Post,
      key: 'id',
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'hidden'),
    defaultValue: 'active',
  }
}, {
  tableName: 'comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Associations
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });

module.exports = Comment;
