const GetPostsUseCase = require('../usecases/getPosts.usecase');
const CreatePostUseCase = require('../usecases/createPost.usecase');
const GetPostDetailUseCase = require('../usecases/getPostDetail.usecase');
const SavePostUseCase = require('../usecases/savePost.usecase');
const UnsavePostUseCase = require('../usecases/unsavePost.usecase');
const GetSavedPostsUseCase = require('../usecases/getSavedPosts.usecase');

class PostController {
  
  // Restore create method
  static async create(req, res) {
    try {
      const userId = req.user.userId;
      const { title, content, categoryId } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const result = await CreatePostUseCase.execute(userId, { title, content, categoryId }, ip);
      res.status(result.status === 'pending' ? 202 : 201).json({ success: true, data: result });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  // Restore detail method
  static async getPostDetail(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const result = await GetPostDetailUseCase.execute(id, user); // Assuming this usecase exists
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }


  /**
   * DELETE /api/posts/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const role = req.user.role;

      // Find post to verify ownership
      const post = await require('../repositories/post.repository').findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
      if (post.user_id !== userId && role !== 'admin' && role !== 'moderator') {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bài viết này' });
      }

      await require('../repositories/post.repository').delete(id);
      res.status(200).json({ success: true, message: 'Đã xóa bài viết' });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/posts/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { title, content, categoryId } = req.body;

      const post = await require('../repositories/post.repository').findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
      if (post.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa bài viết này' });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (categoryId) updateData.category_id = categoryId;

      await require('../models/post.model').update(updateData, { where: { id } });
      res.status(200).json({ success: true, message: 'Cập nhật bài viết thành công' });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/posts
   */
  static async getPosts(req, res) {
    try {
      const { page, limit, sort, authorId, search } = req.query;
      const userId = req.user?.userId || null;
      const result = await GetPostsUseCase.execute({ page, limit, sort, userId, authorId, search });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getSaved(req, res) {
    try {
      const { page, limit } = req.query;
      const userId = req.user.userId;
      const result = await GetSavedPostsUseCase.execute(userId, { page, limit });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async save(req, res) {
    try {
      const userId = req.user.userId;
      const { postId } = req.params;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const result = await SavePostUseCase.execute(userId, postId, ip);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  static async unsave(req, res) {
    try {
      const userId = req.user.userId;
      const { postId } = req.params;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const result = await UnsavePostUseCase.execute(userId, postId, ip);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }
}

module.exports = PostController;
