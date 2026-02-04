const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Category = require('./category.model');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
    }
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
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE' // Or SET NULL depending on business requirement, but CASCADE is standard for strict cleanup
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'hidden'),
    defaultValue: 'active',
    allowNull: false,
  },
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  comment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
}, {
  tableName: 'posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_posts_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_posts_category_id',
      fields: ['category_id']
    },
    {
      name: 'idx_posts_status',
      fields: ['status']
    },
    {
      name: 'idx_posts_created_at',
      fields: ['created_at']
    }
  ]
});

// Define Associations
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Post.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Add reverse associations if needed elsewhere (User.hasMany(Post), etc.), 
// but defining here ensures Post loads correctly.
User.hasMany(Post, { foreignKey: 'user_id' });
Category.hasMany(Post, { foreignKey: 'category_id' });

module.exports = Post;
