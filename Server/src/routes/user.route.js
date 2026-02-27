const router = require('express').Router();
const UserRepository = require('../repositories/user.repository');

// GET /api/users/:id
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
                created_at: user.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
