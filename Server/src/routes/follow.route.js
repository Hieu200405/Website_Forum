const express = require('express');
const router = express.Router();
const FollowRepository = require('../../repositories/follow.repository');
const UserRepository = require('../../repositories/user.repository');
const authMiddleware = require('../../middlewares/auth.middleware');
const NotificationService = require('../../services/notification.service');
const LoggingService = require('../../services/logging.service');

// Default API route that maps to /api/users/follow
router.post('/:id/follow', authMiddleware, async (req, res) => {
    try {
        const followerId = req.user.userId;
        const followingId = req.params.id;

        if (followerId == followingId) {
            return res.status(400).json({ success: false, message: 'Bạn không thể tự follow chính mình' });
        }

        const userToFollow = await UserRepository.findById(followingId);
        if (!userToFollow) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        }

        const isFollowing = await FollowRepository.isFollowing(followerId, followingId);
        if (isFollowing) {
            return res.status(400).json({ success: false, message: 'Bạn đã follow người này rồi' });
        }

        await FollowRepository.follow(followerId, followingId);

        // Gửi thông báo
        const app = req.app;
        await NotificationService.createNotification(app, {
            user_id: followingId,
            sender_id: followerId,
            type: 'USER',
            reference_id: followerId, // link back to follower
            content: 'đã bắt đầu theo dõi bạn'
        });

        await LoggingService.log(followerId, 'FOLLOW_USER', req.ip, { followingId });

        res.status(200).json({ success: true, message: 'Đã theo dõi người dùng' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:id/unfollow', authMiddleware, async (req, res) => {
    try {
        const followerId = req.user.userId;
        const followingId = req.params.id;

        const isFollowing = await FollowRepository.isFollowing(followerId, followingId);
        if (!isFollowing) {
            return res.status(400).json({ success: false, message: 'Bạn chưa follow người này' });
        }

        await FollowRepository.unfollow(followerId, followingId);

        await LoggingService.log(followerId, 'UNFOLLOW_USER', req.ip, { followingId });

        res.status(200).json({ success: true, message: 'Đã hủy theo dõi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id/followers', async (req, res) => {
    try {
        const followers = await FollowRepository.getFollowers(req.params.id);
        res.status(200).json({ success: true, data: followers.map(f => f.Follower) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id/following', async (req, res) => {
    try {
        const following = await FollowRepository.getFollowing(req.params.id);
        res.status(200).json({ success: true, data: following.map(f => f.FollowingUser) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id/check-follow', authMiddleware, async (req, res) => {
    try {
        const followerId = req.user.userId;
        const followingId = req.params.id;
        const isFollowing = await FollowRepository.isFollowing(followerId, followingId);
        res.status(200).json({ success: true, isFollowing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
