const CreatePostUseCase = require('../usecases/createPost.usecase');
const GetPostsUseCase = require('../usecases/getPosts.usecase');
const GetPostDetailUseCase = require('../usecases/getPostDetail.usecase');

class PostController {
  
  /**
   * API: Xem chi tiết bài viết
   * GET /api/posts/:id
   */
  static async getDetail(req, res) {
    try {
      // req.user có thể undefined nếu guest, middleware auth check token tùy chọn (optional auth)
      // Nhưng nếu route dùng authMiddleware bắt buộc thì req.user luôn có.
      // Với endpoint này, guest cũng xem được, nên cần xử lý middleware linh hoạt hoặc tách logic.
      // Giả sử route controller nhận user từ req.user (nếu middleware đã giải mã)
      
      const result = await GetPostDetailUseCase.execute(req.params.id, req.user);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error fetching post detail'
      });
    }
  }

  /**
   * API: Lấy danh sách bài viết
   * GET /api/posts
   */
  static async getList(req, res) {
    try {
      const { page, limit, categoryId, sortBy } = req.query;
      
      const result = await GetPostsUseCase.execute({ 
        page, 
        limit, 
        categoryId, 
        sortBy 
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching posts'
      });
    }
  }

  /**
   * API Tạo bài viết
   * POST /api/posts
   */
  static async create(req, res) {
    try {
      const userId = req.user.userId;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      
      const result = await CreatePostUseCase.execute(userId, req.body, ip);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error'
      });
    }
  }
}

module.exports = PostController;
