const router = require('express').Router();
const UserRepository = require('../repositories/user.repository');
const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const bcrypt = require('bcrypt');

// GET /api/users/me - get current user profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await UserRepository.findById(req.user.userId);
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role,
                reputation: user.reputation,
                created_at: user.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/users/me - update current user profile
router.put('/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { username, bio, currentPassword, newPassword, avatar } = req.body;
        
        const user = await UserRepository.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

        const updateData = {};

        // Update username (check for duplicates)
        if (username && username !== user.username) {
            if (username.length < 4 || username.length > 30) {
                return res.status(400).json({ success: false, message: 'Tên người dùng phải từ 4-30 ký tự' });
            }
            const existing = await UserRepository.findByUsername(username);
            if (existing && existing.id !== userId) {
                return res.status(409).json({ success: false, message: 'Tên người dùng đã tồn tại' });
            }
            updateData.username = username;
        }

        // Update bio
        if (bio !== undefined) updateData.bio = bio;

        // Update avatar URL (Cloudinary URL from frontend)
        if (avatar !== undefined) updateData.avatar = avatar;

        // Update password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có nhất 8 ký tự' });
            }
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        await UserRepository.update(userId, updateData);
        const updated = await UserRepository.findById(userId);

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: {
                id: updated.id,
                username: updated.username,
                email: updated.email,
                avatar: updated.avatar,
                bio: updated.bio,
                role: updated.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/users/leaderboard - get top users by reputation
router.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await UserRepository.getTopReputation(10);
        res.status(200).json({
            success: true,
            data: topUsers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/users/:id - get public profile
router.get('/:id', async (req, res) => {
    try {
        const user = await UserRepository.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        }
        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role,
                reputation: user.reputation,
                created_at: user.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
