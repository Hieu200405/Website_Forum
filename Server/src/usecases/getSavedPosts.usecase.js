const SavedPost = require('../models/savedPost.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Like = require('../models/like.model');
const Comment = require('../models/comment.model');

class GetSavedPostsUseCase {
  static async execute(userId, { page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    const { count, rows } = await SavedPost.findAndCountAll({
      where: { user_id: userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Post,
          where: { status: 'active' }, // Chỉ lấy bài viết đang active
          include: [
            { model: User, as: 'author', attributes: ['id', 'username'] },
            { model: Category, as: 'category', attributes: ['name'] }
          ]
        }
      ]
    });

    const formattedData = await Promise.all(rows.map(async (row) => {
      const post = row.Post;

      // Tính lại isLiked nếu cần, hoặc giả định luôn false, ta chỉ query isLiked cho người xem
      // (có thể tối ưu bằng SQL JOIN / count if needed)
      const likeCount = await Like.count({ where: { post_id: post.id } });
      const commentCount = await Comment.count({ where: { post_id: post.id, status: 'active' } });
      const isLiked = await Like.findOne({ where: { post_id: post.id, user_id: userId } });

      return {
        id: post.id,
        title: post.title,
        imageUrl: post.image_url,
        createdAt: post.created_at,
        likeCount,
        commentCount,
        category: post.category?.name || 'Thảo luận',
        author: {
          id: post.author?.id,
          username: post.author?.username || 'Ẩn danh'
        },
        isSaved: true,
        isLiked: !!isLiked
      };
    }));

    return {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      data: formattedData
    };
  }
}

module.exports = GetSavedPostsUseCase;
