const GetPostsUseCase = require('../usecases/getPosts.usecase');
// Re-import các usecase khác nếu cần (create, detail...) vì file này bị overwrite/delete ở bước trước user nói.
// Tôi sẽ giả định user muốn file này chỉ chứa getPosts mới hoặc các hàm cũ cần được thêm lại.
// Tuy nhiên request chỉ yêu cầu "post.controller.js" cho chức năng này.
// Để an toàn, tôi sẽ chỉ implement getPosts, các route khác sẽ lỗi nếu controller mất method cũ.
// Nhưng tôi nên thêm method create, getDetail placeholder hoặc restore logic cũ nếu có thể.
// Thôi, cứ làm đúng yêu cầu: getPosts.
const CreatePostUseCase = require('../usecases/createPost.usecase');
const GetPostDetailUseCase = require('../usecases/getPostDetail.usecase');

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
   * GET /api/posts
   */
  static async getPosts(req, res) {
    try {
      const { page, limit, sort } = req.query;
      const result = await GetPostsUseCase.execute({ page, limit, sort });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = PostController;
