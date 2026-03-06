const { QueryTypes, Op } = require('sequelize');
const sequelize = require('../config/database');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');

class GetAdminStatsUseCase {
  static async execute() {
    // ─── Basic counts ───────────────────────────────────────────
    const [totalUsers, totalPosts, totalComments, totalLikes, pendingPosts, bannedUsers, hiddenPosts] = await Promise.all([
      User.count(),
      Post.count(),
      Comment.count({ where: { status: 'active' } }),
      Like.count(),
      Post.count({ where: { status: 'pending' } }),
      User.count({ where: { status: 'banned' } }),
      Post.count({ where: { status: 'hidden' } }),
    ]);

    // ─── Users registered per day (last 30 days) ────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersByDay = await sequelize.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= :from
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, { replacements: { from: thirtyDaysAgo }, type: QueryTypes.SELECT });

    // ─── Posts per day (last 30 days) ───────────────────────────
    const postsByDay = await sequelize.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM posts
      WHERE created_at >= :from
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, { replacements: { from: thirtyDaysAgo }, type: QueryTypes.SELECT });

    // ─── Posts per Category (for Doughnut) ──────────────────────
    const postsByCategory = await sequelize.query(`
      SELECT c.name as category, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN posts p ON p.category_id = c.id AND p.status = 'active'
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT 8
    `, { type: QueryTypes.SELECT });

    // ─── Posts by day of week (Bar chart) ────────────────────────
    const postsByWeekday = await sequelize.query(`
      SELECT DAYOFWEEK(created_at) as dow, COUNT(*) as count
      FROM posts
      GROUP BY DAYOFWEEK(created_at)
      ORDER BY dow ASC
    `, { type: QueryTypes.SELECT });

    // ─── Comments per day (last 14 days) ────────────────────────
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const commentsByDay = await sequelize.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM comments
      WHERE created_at >= :from AND status = 'active'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, { replacements: { from: fourteenDaysAgo }, type: QueryTypes.SELECT });

    // ─── Top active users (most posts) ─────────────────────────
    const topPosters = await sequelize.query(`
      SELECT u.id, u.username, u.avatar, u.reputation, COUNT(p.id) as postCount
      FROM users u
      LEFT JOIN posts p ON p.user_id = u.id AND p.status = 'active'
      GROUP BY u.id
      ORDER BY postCount DESC
      LIMIT 5
    `, { type: QueryTypes.SELECT });

    return {
      overview: {
        totalUsers,
        totalPosts,
        totalComments,
        totalLikes,
        pendingPosts,
        bannedUsers,
        hiddenPosts,
        activePostsRate: totalPosts > 0 ? Math.round(((totalPosts - hiddenPosts - pendingPosts) / totalPosts) * 100) : 100,
      },
      charts: {
        usersByDay,
        postsByDay,
        postsByCategory,
        postsByWeekday,
        commentsByDay,
      },
      topPosters,
    };
  }
}

module.exports = GetAdminStatsUseCase;
