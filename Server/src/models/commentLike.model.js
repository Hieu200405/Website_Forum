const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Comment = require('./comment.model');

const CommentLike = sequelize.define('CommentLike', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' },
    },
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Comment, key: 'id' },
    },
}, {
    tableName: 'comment_likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { unique: true, fields: ['user_id', 'comment_id'] },
    ],
});

// Associations
CommentLike.belongsTo(User,    { foreignKey: 'user_id' });
CommentLike.belongsTo(Comment, { foreignKey: 'comment_id' });
Comment.hasMany(CommentLike,   { foreignKey: 'comment_id', as: 'likes', onDelete: 'CASCADE' });

module.exports = CommentLike;
