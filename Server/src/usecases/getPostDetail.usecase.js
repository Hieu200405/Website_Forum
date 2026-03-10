const PostRepository = require('../repositories/post.repository');
const CommentRepository = require('../repositories/comment.repository');
const LikeRepository = require('../repositories/like.repository');
const SavedPostRepository = require('../repositories/savedPost.repository');
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
    const comments = await CommentRepository.findAllByPostId(postId);

    // 4. Check Like, Save & Follow Status
    let isLiked = false;
    let isSaved = false;
    let isFollowingAuthor = false;
    if (user && user.userId) {
      const Follow = require('../models/follow.model');
      [isLiked, isSaved, isFollowingAuthor] = await Promise.all([
        LikeRepository.exists(user.userId, postId),
        SavedPostRepository.exists(user.userId, postId),
        Follow.findOne({ where: { follower_id: user.userId, following_id: post.user_id } }).then(r => !!r)
      ]);
    }

    // 5. Format kết quả
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.image_url,
      status: post.status,
      createdAt: post.created_at,
      likesCount: post.like_count,
      likeCount: post.like_count,
      commentsCount: post.comment_count, 
      commentCount: post.comment_count, 
      isLiked,
      isSaved,
      author: {
        id: post.author.id,
        username: post.author.username,
        role: post.author.role,
        avatar: post.author.avatar,
        reputation: post.author.reputation,
        isFollowing: isFollowingAuthor
      },
      category: {
        id: post.category.id,
        name: post.category.name
      },
      comments: comments.map(c => ({
        id: c.id,
        content: c.content,
        imageUrl: c.image_url,
        createdAt: c.created_at,
        author: {
          id: c.author.id,
          username: c.author.username,
          avatar: c.author?.avatar, // Added avatar
          role: c.author.role
        }
      }))
    };
  }
}

module.exports = GetPostDetailUseCase;
