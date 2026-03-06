const Follow = require('../models/follow.model');
const User = require('../models/user.model');

class FollowRepository {
    async follow(followerId, followingId) {
        return await Follow.create({
            follower_id: followerId,
            following_id: followingId
        });
    }

    async unfollow(followerId, followingId) {
        return await Follow.destroy({
            where: {
                follower_id: followerId,
                following_id: followingId
            }
        });
    }

    async isFollowing(followerId, followingId) {
        const count = await Follow.count({
            where: {
                follower_id: followerId,
                following_id: followingId
            }
        });
        return count > 0;
    }

    async getFollowers(userId) {
        return await Follow.findAll({
            where: { following_id: userId },
            include: [{
                model: User,
                as: 'Follower', // Need to setup associations
                attributes: ['id', 'username', 'avatar', 'reputation']
            }]
        });
    }

    async getFollowing(userId) {
        return await Follow.findAll({
            where: { follower_id: userId },
            include: [{
                model: User,
                as: 'FollowingUser',
                attributes: ['id', 'username', 'avatar', 'reputation']
            }]
        });
    }
}

module.exports = new FollowRepository();
