const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Post = require('./post.model');

const SavedPost = sequelize.define('SavedPost', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Post,
      key: 'id'
    }
  }
}, {
  tableName: 'saved_posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'post_id']
    }
  ]
});

SavedPost.belongsTo(User, { foreignKey: 'user_id' });
SavedPost.belongsTo(Post, { foreignKey: 'post_id', onDelete: 'CASCADE' });
User.hasMany(SavedPost, { foreignKey: 'user_id' });
Post.hasMany(SavedPost, { foreignKey: 'post_id', onDelete: 'CASCADE' });

module.exports = SavedPost;
