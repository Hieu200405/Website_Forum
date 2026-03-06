const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Follow = sequelize.define('Follow', {
    follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    following_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'follows',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

const User = require('./user.model');

// Define relationships
User.belongsToMany(User, {
    as: 'Followers',
    through: Follow,
    foreignKey: 'following_id',
    otherKey: 'follower_id'
});

User.belongsToMany(User, {
    as: 'Following',
    through: Follow,
    foreignKey: 'follower_id',
    otherKey: 'following_id'
});

Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'Follower' });
Follow.belongsTo(User, { foreignKey: 'following_id', as: 'FollowingUser' });

module.exports = Follow;
