const User = require('../models/user.model');
const Post = require('../models/post.model');

class GetAdminStatsUseCase {
  static async execute() {
    const totalUsers = await User.count();
    const totalPosts = await Post.count({ where: { status: 'active' } }); // Or count all if you prefer, but usually active posts matter. Actually let's count all posts for consistency with admin dashboard.
    const allPostsCount = await Post.count();
    
    return {
      totalUsers,
      totalPosts: allPostsCount
    };
  }
}

module.exports = GetAdminStatsUseCase;
