const User = require('../../../Server/src/models/user.model');
const Post = require('../../../Server/src/models/post.model');
const Comment = require('../../../Server/src/models/comment.model');
const Category = require('../../../Server/src/models/category.model');
const Report = require('../../../Server/src/models/report.model');
const SavedPost = require('../../../Server/src/models/savedPost.model');
const SystemLog = require('../../../Server/src/models/systemLog.model');
const Follow = require('../../../Server/src/models/follow.model');
const Like = require('../../../Server/src/models/like.model');
const CommentLike = require('../../../Server/src/models/commentLike.model');
const Notification = require('../../../Server/src/models/notification.model');
const BannedWord = require('../../../Server/src/models/bannedWord.model');

describe('Model definitions and associations', () => {
  it('User defines core attributes and table metadata', () => {
    expect(User.tableName).toBe('users');
    expect(User.rawAttributes.username.allowNull).toBe(false);
    expect(User.rawAttributes.email.unique).toBe(true);
    expect(User.rawAttributes.role.defaultValue).toBeDefined();
    expect(User.rawAttributes.status.defaultValue).toBe('active');
  });

  it('Post defines status enum and associations', () => {
    expect(Post.tableName).toBe('posts');
    expect(Post.rawAttributes.status.values).toEqual(['active', 'pending', 'hidden']);
    expect(Post.associations.author).toBeDefined();
    expect(Post.associations.category).toBeDefined();
  });

  it('Comment defines self-referencing and author associations', () => {
    expect(Comment.tableName).toBe('comments');
    expect(Comment.rawAttributes.parent_id.allowNull).toBe(true);
    expect(Comment.associations.author).toBeDefined();
    expect(Comment.associations.replies).toBeDefined();
    expect(Comment.associations.parent).toBeDefined();
  });

  it('Category defines unique name field', () => {
    expect(Category.tableName).toBe('categories');
    expect(Category.rawAttributes.name.unique).toBe(true);
  });

  it('Report defines pending default status and linked associations', () => {
    expect(Report.tableName).toBe('reports');
    expect(Report.rawAttributes.status.defaultValue).toBe('pending');
    expect(Report.associations.reporter).toBeDefined();
    expect(Report.associations.post).toBeDefined();
  });

  it('SavedPost defines composite unique index and associations', () => {
    expect(SavedPost.tableName).toBe('saved_posts');
    expect(SavedPost.options.indexes[0].unique).toBe(true);
    expect(SavedPost.associations.User).toBeDefined();
    expect(SavedPost.associations.Post).toBeDefined();
  });

  it('SystemLog defines created-only timestamp and user field mapping', () => {
    expect(SystemLog.tableName).toBe('system_logs');
    expect(SystemLog.options.updatedAt).toBe(false);
    expect(SystemLog.rawAttributes.userId.field).toBe('user_id');
  });

  it('Follow defines composite primary keys and user associations', () => {
    expect(Follow.tableName).toBe('follows');
    expect(Follow.rawAttributes.follower_id.primaryKey).toBe(true);
    expect(Follow.rawAttributes.following_id.primaryKey).toBe(true);
    expect(Follow.associations.Follower).toBeDefined();
    expect(Follow.associations.FollowingUser).toBeDefined();
  });

  it('Like defines unique user/post index', () => {
    expect(Like.tableName).toBe('likes');
    expect(Like.options.indexes[0].unique).toBe(true);
  });

  it('CommentLike defines unique user/comment index', () => {
    expect(CommentLike.tableName).toBe('comment_likes');
    expect(CommentLike.options.indexes[0].unique).toBe(true);
    expect(CommentLike.associations.Comment).toBeDefined();
  });

  it('Notification defines expected enum type and read default', () => {
    expect(Notification.tableName).toBe('notifications');
    expect(Notification.rawAttributes.type.values).toEqual(['LIKE', 'COMMENT', 'APPROVE', 'REJECT']);
    expect(Notification.rawAttributes.isRead.defaultValue).toBe(false);
    expect(Notification.associations.user).toBeDefined();
    expect(Notification.associations.sender).toBeDefined();
  });

  it('BannedWord defines lowercase-setter field and uniqueness', () => {
    expect(BannedWord.tableName).toBe('banned_words');
    expect(BannedWord.rawAttributes.word.unique).toBe(true);
    expect(typeof BannedWord.rawAttributes.word.set).toBe('function');
  });
});
