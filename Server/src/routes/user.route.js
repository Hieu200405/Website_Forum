const router = require('express').Router();
const UserRepository = require('../repositories/user.repository');
const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Lấy thông tin cá nhân
 *     description: Trả về thông tin đầy đủ của tài khoản đang đăng nhập.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Thông tin cá nhân
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/User' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   put:
 *     tags: [Users]
 *     summary: Cập nhật thông tin cá nhân
 *     description: Cập nhật username, bio, avatar, hoặc đổi mật khẩu.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:        { type: string, example: new_username }
 *               bio:             { type: string, example: Tôi là developer }
 *               avatar:          { type: string, format: uri }
 *               currentPassword: { type: string, format: password }
 *               newPassword:     { type: string, format: password }
 *     responses:
 *       200:
 *         description: ✅ Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
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

router.put('/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { username, bio, currentPassword, newPassword, avatar } = req.body;
        
        const user = await UserRepository.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

        const updateData = {};

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

        if (bio !== undefined) updateData.bio = bio;
        if (avatar !== undefined) updateData.avatar = avatar;

        if (newPassword) {
            if (!currentPassword) return res.status(400).json({ success: false, message: 'Cần nhập mật khẩu hiện tại' });
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
            if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Mật khẩu mới phải ít nhất 6 ký tự' });
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(updateData).length === 0) return res.status(400).json({ success: false, message: 'Không có thông tin cần cập nhật' });

        await UserRepository.update(userId, updateData);
        const updatedUser = await UserRepository.findById(userId);
        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /users/{id}/profile:
 *   get:
 *     tags: [Users]
 *     summary: Xem hồ sơ người dùng
 *     description: Lấy thông tin công khai của một người dùng bất kỳ, kèm thống kê.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 5
 *     responses:
 *       200:
 *         description: ✅ Hồ sơ người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   allOf:
 *                     - { $ref: '#/components/schemas/User' }
 *                     - type: object
 *                       properties:
 *                         bio:            { type: string }
 *                         followerCount:  { type: integer, example: 42 }
 *                         followingCount: { type: integer, example: 15 }
 *                         postCount:      { type: integer, example: 30 }
 *                         isFollowing:    { type: boolean, example: false }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id/profile', async (req, res) => {
    try {
        const Follow = require('../models/follow.model');
        const Post = require('../models/post.model');
        const authHeader = req.headers['authorization'];
        let currentUserId = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const jwt = require('jsonwebtoken');
                const config = require('../config/jwt');
                const decoded = jwt.verify(token, config.secret);
                currentUserId = decoded.userId;
            } catch (e) { /* silent */ }
        }

        const user = await UserRepository.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

        const [followerCount, followingCount, postCount, isFollowing] = await Promise.all([
            Follow.count({ where: { following_id: user.id } }),
            Follow.count({ where: { follower_id: user.id } }),
            Post.count({ where: { user_id: user.id, status: 'active' } }),
            currentUserId ? Follow.findOne({ where: { follower_id: currentUserId, following_id: user.id } }).then(r => !!r) : false,
        ]);

        res.json({
            success: true,
            data: {
                id: user.id, username: user.username, email: user.email,
                avatar: user.avatar, bio: user.bio, role: user.role,
                reputation: user.reputation, status: user.status,
                created_at: user.created_at,
                followerCount, followingCount, postCount, isFollowing,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /users/{id}/posts:
 *   get:
 *     tags: [Users]
 *     summary: Lấy bài viết của người dùng
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: ✅ Danh sách bài viết của người dùng
 */
router.get('/:id/posts', async (req, res) => {
    try {
        const Post = require('../models/post.model');
        const Category = require('../models/category.model');
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { rows, count } = await Post.findAndCountAll({
            where: { user_id: req.params.id, status: 'active' },
            include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset,
        });

        res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /users/{id}/follow:
 *   post:
 *     tags: [Users]
 *     summary: Theo dõi người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID người dùng muốn theo dõi
 *     responses:
 *       200:
 *         description: ✅ Đã theo dõi
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     tags: [Users]
 *     summary: Bỏ theo dõi người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: ✅ Đã bỏ theo dõi
 */
router.post('/:id/follow', authMiddleware, async (req, res) => {
    try {
        const Follow = require('../models/follow.model');
        const followerId = req.user.userId;
        const followingId = parseInt(req.params.id);
        if (followerId === followingId) return res.status(400).json({ success: false, message: 'Không thể tự theo dõi mình' });
        const [, created] = await Follow.findOrCreate({ where: { follower_id: followerId, following_id: followingId } });
        res.json({ success: true, message: created ? 'Đã theo dõi' : 'Bạn đã theo dõi người này rồi' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id/follow', authMiddleware, async (req, res) => {
    try {
        const Follow = require('../models/follow.model');
        await Follow.destroy({ where: { follower_id: req.user.userId, following_id: req.params.id } });
        res.json({ success: true, message: 'Đã bỏ theo dõi' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /users/leaderboard:
 *   get:
 *     tags: [Users]
 *     summary: Bảng xếp hạng uy tín
 *     description: Top 10 người dùng có điểm uy tín cao nhất. Kết quả được **cache Redis 5 phút**.
 *     responses:
 *       200:
 *         description: ✅ Top 10 người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const UserRepository = require('../repositories/user.repository');
        const redisService = require('../services/redis.service');
        const CACHE_KEY = 'leaderboard:top10';
        
        const cached = await redisService.get(CACHE_KEY);
        if (cached) {
            return res.json({ success: true, data: JSON.parse(cached) });
        }

        const users = await UserRepository.getTopReputation(10);

        await redisService.set(CACHE_KEY, JSON.stringify(users), 300); // 5 minutes
        
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /users/me/avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload ảnh đại diện
 *     description: Upload ảnh lên Cloudinary và cập nhật avatar người dùng.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh (jpg/png/webp, tối đa 5MB)
 *     responses:
 *       200:
 *         description: ✅ Upload thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 avatarUrl: { type: string, format: uri }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/me/avatar', authMiddleware, uploadMiddleware.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Không có file được tải lên' });
        const avatarUrl = req.file.path;
        await UserRepository.update(req.user.userId, { avatar: avatarUrl });
        res.json({ success: true, message: 'Cập nhật avatar thành công', avatarUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
