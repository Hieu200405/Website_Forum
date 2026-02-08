const PostRepository = require('../repositories/post.repository');
const CommentRepository = require('../repositories/comment.repository');
const LikeRepository = require('../repositories/like.repository');
const ROLES = require('../constants/roles');

class GetPostDetailUseCase {
  /**
   * Xem chi tiết bài viết
   * @param {number} postId 
   * @param {object} user - User request (có thể null nếu guest)
   */
  static async execute(postId, user) {
    // 1. Lấy thông tin bài viết
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw { status: 404, message: 'Bài viết không tồn tại' };
    }

    // 2. Kiểm tra quyền truy cập (nếu bài không active)
    if (post.status !== 'active') {
      const isAllowed = user && [ROLES.ADMIN, ROLES.MODERATOR].includes(user.role);
      
      // Cho phép tác giả xem bài của chính mình dù đang pending
      const isAuthor = user && user.userId === post.user_id;

      if (!isAllowed && !isAuthor) {
        throw { status: 403, message: 'Bạn không có quyền xem bài viết này' };
      }
    }

    // 3. Lấy comments
    const comments = await CommentRepository.findByPostId(postId);

    // 4. Check Like Status
    let isLiked = false;
    if (user && user.userId) {
      isLiked = await LikeRepository.exists(user.userId, postId);
    }

    // 5. Format kết quả
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      status: post.status,
      createdAt: post.created_at,
      likesCount: post.like_count,
      commentsCount: post.comment_count, 
      isLiked, // Added
      author: {
        id: post.author.id,
        username: post.author.username,
        role: post.author.role
      },
      category: {
        id: post.category.id,
        name: post.category.name
      },
      comments: comments.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.created_at,
        author: {
          id: c.author.id,
          username: c.author.username,
          role: c.author.role
        }
      }))
    };
  }
}

module.exports = GetPostDetailUseCase;
