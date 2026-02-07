
require('dotenv').config();
const sequelize = require('./config/database');
const bcrypt = require('bcrypt');

const User = require('./models/user.model');
const Post = require('./models/post.model');
const Category = require('./models/category.model');
const Comment = require('./models/comment.model');
const Like = require('./models/like.model');
const Report = require('./models/report.model');
const ROLES = require('./constants/roles');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB Connected');
    
    sequelize.options.logging = false; // Disable SQL logging for cleaner output

    // WARNING: This drops all tables and recreates them
    await sequelize.sync({ force: true }); 
    console.log('Database Schema Re-synced (Tables Dropped & Recreated)');

    const passwordHash = await bcrypt.hash('12345678', 10);

    // 1. Create Users
    const usersData = [
        { username: 'admin', email: 'admin@gmail.com', password: passwordHash, role: ROLES.ADMIN, isVerified: true },
        { username: 'moderator', email: 'mod@gmail.com', password: passwordHash, role: ROLES.MODERATOR, isVerified: true },
        { username: 'user1', email: 'user1@gmail.com', password: passwordHash, role: ROLES.USER, isVerified: true }, // Active user
        { username: 'user2', email: 'user2@gmail.com', password: passwordHash, role: ROLES.USER, isVerified: true }, // Active user
        { username: 'spammer', email: 'spam@gmail.com', password: passwordHash, role: ROLES.USER, isVerified: true, status: 'banned', banned_reason: 'Spamming' }, // Banned User
    ];

    const users = await User.bulkCreate(usersData, { returning: true });
    // Map usage: users[0] is admin, users[1] is mod, users[2] is user1...
    const [adminUser, modUser, user1, user2, spammer] = users;
    console.log('Users created');

    // 2. Create Categories
    const categoriesData = [
        { name: 'Thảo luận chung', description: 'Nơi thảo luận về mọi chủ đề' },
        { name: 'Công nghệ', description: 'Tin tức, chia sẻ về công nghệ, lập trình' },
        { name: 'Đời sống', description: 'Chia sẻ chuyện đời thường, tâm sự' },
        { name: 'Hỏi đáp', description: 'Nơi đặt câu hỏi và nhận câu trả lời' },
        { name: 'Review', description: 'Đánh giá sản phẩm, dịch vụ, phim ảnh' },
    ];
    
    // Use .map to get instances if needed, or just insert
    const categories = await Category.bulkCreate(categoriesData, { returning: true });
    const [catGeneral, catTech, catLife, catQA, catReview] = categories;
    console.log('Categories created');

    // 3. Create Posts
    const postsData = [
        // Tech Posts
        { 
            title: 'Tại sao React lạ vậy?', 
            content: 'Mình mới học React và thấy nó khác hẳn jQuery. Mọi người có tips gì không?', 
            user_id: user1.id, 
            category_id: catTech.id,
            status: 'active',
            like_count: 5,
            comment_count: 2
        },
        { 
            title: 'Review laptop Gaming mới ra', 
            content: 'Con máy này chiến game ngon, tản nhiệt tốt nhưng pin hơi hẻo.', 
            user_id: user2.id, 
            category_id: catTech.id, 
            status: 'active',
            like_count: 12,
            comment_count: 1
        },
        // Life Posts
        { 
            title: 'Hôm nay trời đẹp quá', 
            content: 'Sáng dậy thấy nắng đẹp, xách xe đi lượn một vòng hồ Tây chill phết.', 
            user_id: user1.id, 
            category_id: catLife.id, 
            status: 'active',
            like_count: 20,
            comment_count: 3
        },
        { 
            title: 'Chuyện công sở: Deadline dí', 
            content: 'Cuối năm rồi mà deadline ngập đầu, sếp thì hối liên tục. Có ai đồng cảm không?', 
            user_id: user2.id, 
            category_id: catLife.id, 
            status: 'active',
            like_count: 8,
            comment_count: 0
        },
        // QA
        { 
            title: 'Lỗi không đăng nhập được?', 
            content: 'Mình thử đăng nhập nhưng toàn báo lỗi 500. Admin check giúp với.', 
            user_id: user1.id, 
            category_id: catQA.id, 
            status: 'active',
            like_count: 1,
            comment_count: 1
        },
        // Spam/Reported Post
        { 
            title: 'Kiếm tiền online nhanh chóng!!!', 
            content: 'Click vào link này để nhận 1 tỷ đồng ngay lập tức: http://scam.com', 
            user_id: spammer.id, 
            category_id: catGeneral.id, 
            status: 'active', // Will be reported
            like_count: 0,
            comment_count: 0
        },
        // Hidden Post (Moderated)
        { 
            title: 'Bài viết vi phạm (Đã ẩn)', 
            content: 'Nội dung này vi phạm tiêu chuẩn cộng đồng nên đã bị ẩn.', 
            user_id: spammer.id, 
            category_id: catGeneral.id, 
            status: 'hidden',
            hide_reason: 'Vi phạm chính sách nội dung',
            like_count: 0,
            comment_count: 0
        }
    ];

    const posts = await Post.bulkCreate(postsData, { returning: true });
    // posts[0] -> React, posts[5] -> Spam
    console.log('Posts created');

    // 4. Create Comments
    const commentsData = [
        { content: 'Học React thì phải nắm vững JS ES6 trước nhé bác.', user_id: user2.id, post_id: posts[0].id, status: 'active' },
        { content: 'Chuẩn rồi, nhất là arrow function và destructuring.', user_id: modUser.id, post_id: posts[0].id, status: 'active', parent_id: 1 }, // Reply to above logic (assuming ID 1 if auto-inc starts at 1, but safe to fetch parent if not bulk)
        // Wait, bulkCreate IDs might not be sequential reliably across DBs or if forced. 
        // For accurate parent_id, I should create comments sequentially or fetch them.
        // For simplicity in seed, let's create top-level comments first, then replies.
    ];

    // Create top level comments
    const comment1 = await Comment.create({ content: 'Học React thì phải nắm vững JS ES6 trước nhé bác.', user_id: user2.id, post_id: posts[0].id });
    const comment2 = await Comment.create({ content: 'Mình cũng đang hóng con này.', user_id: user1.id, post_id: posts[1].id });
    const comment3 = await Comment.create({ content: 'Chill thế, rủ mình đi với :v', user_id: user2.id, post_id: posts[2].id });
    const comment4 = await Comment.create({ content: 'Admin đang fix nhé bạn.', user_id: modUser.id, post_id: posts[4].id });

    // Create replies
    await Comment.create({ content: 'Chuẩn rồi, nhất là arrow function.', user_id: modUser.id, post_id: posts[0].id, parent_id: comment1.id });
    
    console.log('Comments created');

    // 5. Create Likes
    // User1 likes User2's post and own post (why not)
    // Mod likes legit posts
    await Like.bulkCreate([
        { user_id: user2.id, post_id: posts[0].id }, // User2 likes Post 0
        { user_id: modUser.id, post_id: posts[0].id },
        { user_id: adminUser.id, post_id: posts[0].id },
        { user_id: user1.id, post_id: posts[1].id },
        { user_id: modUser.id, post_id: posts[1].id },
        // ... more likes
    ]);
    console.log('Likes created');

    // 6. Create Reports
    // User1 reports Spammer's post (posts[5])
    await Report.create({
        reason: 'Spam quảng cáo lừa đảo',
        user_id: user1.id,
        post_id: posts[5].id, // The spam post
        status: 'pending'
    });
    
    // User2 also reports it
    await Report.create({
        reason: 'Link độc hại',
        user_id: user2.id,
        post_id: posts[5].id,
        status: 'pending'
    });

    console.log('Reports created');
    
    console.log('SEED COMPLETE Data Ready!');
    console.log('------------------------------------------------');
    console.log('Accounts:');
    console.log('  Admin: admin@gmail.com / 12345678');
    console.log('  Mod:   mod@gmail.com / 12345678');
    console.log('  User1: user1@gmail.com / 12345678');
    console.log('  User2: user2@gmail.com / 12345678');
    console.log('------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('SEED ERROR:', error);
    process.exit(1);
  }
};

run();
