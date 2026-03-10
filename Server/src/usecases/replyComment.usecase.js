const CommentRepository = require('../repositories/comment.repository');
const PostRepository = require('../repositories/post.repository');
const ModerationService = require('../services/moderation.service');
const LoggingService = require('../services/logging.service');
const NotificationService = require('../services/notification.service');

class ReplyCommentUseCase {
  /**
   * Thao tác trả lời bình luận
   * @param {number} userId 
   * @param {object} input - { postId, parentCommentId, content, imageUrl }
   * @param {string} ipAddress 
   */
  static async execute(userId, { postId, parentCommentId, content, imageUrl }, ipAddress, app) {
    // 1. Validate Input
    if (!content || !content.trim()) {
      throw { status: 400, message: 'Nội dung trả lời không được để trống' };
    }
    if (!postId || !parentCommentId) {
      throw { status: 400, message: 'Thiếu thông tin bài viết hoặc bình luận gốc' };
    }

    // 2. Kiểm tra Post tồn tại
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw { status: 404, message: 'Bài viết không tồn tại' };
    }

    // 3. Kiểm tra Parent Comment tồn tại và Active
    const parentComment = await CommentRepository.findById(parentCommentId);
    if (!parentComment) {
      throw { status: 404, message: 'Bình luận gốc không tồn tại' };
    }
    // Nếu parent bị hidden hoặc pending, không cho reply (tùy nghiệp vụ, ở đây chặn cho chặt chẽ)
    if (parentComment.status !== 'active') {
      throw { status: 400, message: 'Không thể trả lời bình luận này (Bình luận gốc không khả dụng)' };
    }
    // Optional: Kiểm tra parentComment có thuộc postId này không?
    if (parentComment.post_id != postId) {
      throw { status: 400, message: 'Dữ liệu không đồng bộ (Comment không thuộc Post này)' };
    }

    // 4. Moderation Check
    const modResult = await ModerationService.check(content);
    const status = modResult.isValid ? 'active' : 'pending';
    
    let violationReason = '';
    if (!modResult.isValid) {
        const uniqueViolations = [...new Set(modResult.bannedWordsFound)];
        let reasonStr = '';
        if (uniqueViolations.length > 0) {
           reasonStr += `Found banned words: ${uniqueViolations.join(', ')}. `;
        }
        if (modResult.aiReason) {
           reasonStr += `AI Flagged: ${modResult.aiReason}.`;
        }
        violationReason = reasonStr.trim();
    }

    // 5. Create Reply
    const reply = await CommentRepository.create({
      user_id: userId,
      post_id: postId,
      parent_id: parentCommentId,
      content,
      image_url: imageUrl || null,
      status
    });

    // 6. Update Post Comment Count (if active)
    if (status === 'active') {
      await PostRepository.increaseCommentCount(postId);
    }

    // 7. Log Action "REPLY_COMMENT"
    await LoggingService.log(
      userId,
      'REPLY_COMMENT',
      ipAddress,
      { 
        replyId: reply.id, 
        parentCommentId, 
        postId, 
        status,
        violationReason: status === 'pending' ? violationReason : null
      }
    );

    // 8. Gửi thông báo cho người được reply
    if (app && parentComment.user_id && status === 'active') {
       await NotificationService.createNotification(app, {
         user_id: parentComment.user_id,
         sender_id: userId,
         type: 'COMMENT',
         reference_id: postId,
         content: 'đã trả lời bình luận của bạn'
       });
    }

    return {
      id: reply.id,
      content: reply.content,
      imageUrl: reply.image_url,
      status: reply.status,
      parentId: reply.parent_id,
      createdAt: reply.created_at,
      message: !modResult.isValid ? 'Trả lời đang chờ duyệt' : 'Trả lời thành công'
    };
  }
}

module.exports = ReplyCommentUseCase;
