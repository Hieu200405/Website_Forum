
require('dotenv').config();
const sequelize = require('./config/database');
const bcrypt = require('bcrypt');

const User = require('./models/user.model');
const Post = require('./models/post.model');
const Category = require('./models/category.model');
const Comment = require('./models/comment.model');
const Like = require('./models/like.model');
const Report = require('./models/report.model');
const SystemLog = require('./models/systemLog.model');
const BannedWord = require('./models/bannedWord.model');
const ROLES = require('./constants/roles');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');
        
        sequelize.options.logging = false; 

        await sequelize.sync({ force: true });
        console.log('--- Database schema refreshed ---');

        const passwordHash = await bcrypt.hash('12345678', 10);
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

        // 1. Create a diverse set of users
        // Users include: Admin, Mod, Regular users with different activity levels, and a Banned user.
        console.log('Seeding Users...');
        const usersData = [
            { username: 'admin', email: 'admin@gmail.com', password: passwordHash, role: ROLES.ADMIN, isVerified: true },
            { username: 'moderator', email: 'mod@gmail.com', password: passwordHash, role: ROLES.MODERATOR, isVerified: true },
            { username: 'dev_guru', email: 'dev@gmail.com', password: passwordHash, role: ROLES.USER, isVerified: true }, // High reputation
            { username: 'newbie_coder', email: 'new@gmail.com', password: passwordHash, role: ROLES.USER, isVerified: true }, // Asks questions
            { username: 'tech_reviewer', email: 'review@gmail.com', password: passwordHash, role: ROLES.USER, isVerified: true }, // Reviews
            { username: 'drama_queen', email: 'drama@gmail.com', password: passwordHash, role: ROLES.USER, isVerified: true }, // Controversial
            { username: 'inactive_user', email: 'ghost@gmail.com', password: passwordHash, role: ROLES.USER, isVerified: true, status: 'active' }, // No posts
            { username: 'spammer_bot', email: 'spam@gmail.com', password: passwordHash, role: ROLES.USER, isVerified: true, status: 'banned', banned_reason: 'Spamming excessive links', banned_at: new Date(now - 2 * oneDay) },
        ];
        
        const createdUsers = await User.bulkCreate(usersData, { returning: true });
        // Map created users for easy access by username
        const users = {};
        createdUsers.forEach(u => users[u.username] = u);

        // 2. Create Categories
        console.log('Seeding Categories...');
        const categoriesData = [
            { name: 'Lập trình', description: 'Thảo luận về code, thuật toán, ngôn ngữ lập trình' },
            { name: 'Phần cứng', description: 'Review linh kiện, build PC, laptop' },
            { name: 'Crypto & Blockchain', description: 'Bitcoin, Ethereum, Web3' },
            { name: 'Review Phim/Game', description: 'Đánh giá các tựa game, phim hot' },
            { name: 'Chuyện nghề nghiệp', description: 'Tâm sự chuyện đi làm, phỏng vấn, lương thưởng' },
            { name: 'Off-topic', description: 'Chém gió linh tinh ngoài lề' },
        ];
        const createdCats = await Category.bulkCreate(categoriesData, { returning: true });
        const cats = {};
        createdCats.forEach(c => cats[c.name] = c);

        // 3. Create Posts (Mixed timestamps for timeline feel)
        console.log('Seeding Posts...');
        const postsData = [
            // Lập trình
            { 
                title: 'Nên học React hay Vue trong năm 2024?', 
                content: 'Mình mới bắt đầu học Frontend, thấy React phổ biến nhưng Vue có vẻ dễ hơn. Mọi người tư vấn giúp với!', 
                user_id: users['newbie_coder'].id, category_id: cats['Lập trình'].id, status: 'active', 
                created_at: new Date(now - 5 * oneDay), 
                like_count: 15, comment_count: 3 
            },
            { 
                title: 'Chia sẻ roadmap trở thành Backend Developer', 
                content: 'Chào anh em, đây là lộ trình mình đã tự học để đạt mức lương 2k$. 1. Học Go/NodeJS. 2. Database SQL/NoSQL. 3. System Design...', 
                user_id: users['dev_guru'].id, category_id: cats['Lập trình'].id, status: 'active', 
                created_at: new Date(now - 3 * oneDay), 
                like_count: 45, comment_count: 10 
            },
            // Phần cứng
            { 
                title: 'RTX 5090 khi nào ra mắt?', 
                content: 'Nghe đồn cuối năm nay ra mắt, anh em đã chuẩn bị thận chưa :))', 
                user_id: users['tech_reviewer'].id, category_id: cats['Phần cứng'].id, status: 'active', 
                created_at: new Date(now - 1 * oneDay), 
                like_count: 8, comment_count: 2 
            },
            // Chuyện nghề nghiệp
            { 
                title: 'Phỏng vấn FPT Software khó không?', 
                content: 'Mình sắp phỏng vấn vị trí Junior Java, ai có kinh nghiệm review quy trình với ạ.', 
                user_id: users['newbie_coder'].id, category_id: cats['Chuyện nghề nghiệp'].id, status: 'active', 
                created_at: new Date(now - 2 * oneDay), 
                like_count: 5, comment_count: 1 
            },
            { 
                title: 'Lương Dev giờ thấp quá vậy?', 
                content: 'Thấy tuyển Senior mà lương có 15tr, bèo bọt quá thể.', 
                user_id: users['drama_queen'].id, category_id: cats['Chuyện nghề nghiệp'].id, status: 'active', 
                created_at: new Date(now - 4 * oneDay), 
                like_count: 2, comment_count: 5 
            },
            // Reported/Spam content
            { 
                title: 'Kiếm $1000 mỗi ngày không cần làm gì', 
                content: 'Chỉ cần tải app này về và nạp 500k: http://scam-link.com', 
                user_id: users['spammer_bot'].id, category_id: cats['Off-topic'].id, status: 'active', 
                created_at: new Date(now - 6 * oneDay), 
                like_count: 0, comment_count: 0 
            },
            // Hidden content
            { 
                title: 'Bài viết chửi bới xúc phạm (Đã ẩn)', 
                content: '*** **** **** (Nội dung thô tục)', 
                user_id: users['drama_queen'].id, category_id: cats['Off-topic'].id, status: 'hidden', 
                hide_reason: 'Ngôn từ đả kích, xúc phạm',
                created_at: new Date(now - 10 * oneDay), 
                like_count: 0, comment_count: 0 
            }
        ];
        
        const createdPosts = await Post.bulkCreate(postsData, { returning: true });
        
        // 4. Create Comments (Threading simulation)
        console.log('Seeding Comments...');
        // Post 0: React vs Vue
        const comm1 = await Comment.create({ content: 'React đi bạn, job nhiều hơn hẳn.', user_id: users['dev_guru'].id, post_id: createdPosts[0].id });
        await Comment.create({ content: 'Nhưng Vue dễ học hơn mà, code clean nữa.', user_id: users['tech_reviewer'].id, post_id: createdPosts[0].id, parent_id: comm1.id }); // Reply
        await Comment.create({ content: 'Cảm ơn mọi người, chắc mình theo React.', user_id: users['newbie_coder'].id, post_id: createdPosts[0].id });

        // Post 1: Roadmap
        await Comment.create({ content: 'Bài viết quá chất lượng, thanks bác!', user_id: users['newbie_coder'].id, post_id: createdPosts[1].id });
        const comm2 = await Comment.create({ content: 'Phần System Design học nguồn nào bác?', user_id: users['tech_reviewer'].id, post_id: createdPosts[1].id });
        await Comment.create({ content: 'Đọc "Desigining Data-Intensive Applications" nhé.', user_id: users['dev_guru'].id, post_id: createdPosts[1].id, parent_id: comm2.id });

        // Post 4: Salary Drama
        await Comment.create({ content: 'Tùy công ty thôi, dìm hàng nhau làm gì.', user_id: users['moderator'].id, post_id: createdPosts[4].id });

        // 5. Create Likes (Bulk)
        console.log('Seeding Likes...');
        const likesData = [];
        // Dev guru gets lots of likes
        [users['newbie_coder'], users['tech_reviewer'], users['moderator'], users['admin'], users['user1']].forEach(u => {
            if(u) likesData.push({ user_id: u.id, post_id: createdPosts[1].id });
        });
        // Like other posts randomly
        likesData.push({ user_id: users['dev_guru'].id, post_id: createdPosts[0].id });
        likesData.push({ user_id: users['admin'].id, post_id: createdPosts[1].id });
        likesData.push({ user_id: users['moderator'].id, post_id: createdPosts[2].id });
        
        await Like.bulkCreate(likesData, { ignoreDuplicates: true }); // Safe insert

        // 6. Create Reports
        console.log('Seeding Reports...');
        await Report.bulkCreate([
            { reason: 'Spam/Lừa đảo', user_id: users['dev_guru'].id, post_id: createdPosts[5].id, status: 'pending' },
            { reason: 'Nội dung rác', user_id: users['tech_reviewer'].id, post_id: createdPosts[5].id, status: 'pending' },
            { reason: 'Gây war', user_id: users['dev_guru'].id, post_id: createdPosts[4].id, status: 'reviewed' }
        ]);

        // 7. Create System Logs (Administrative actions)
        console.log('Seeding System Logs...');
        await SystemLog.bulkCreate([
            { userId: users['admin'].id, action: 'LOGIN', ip: '192.168.1.1', level: 'INFO', created_at: new Date(now - 10 * 60 * 1000) },
            { userId: users['moderator'].id, action: 'HIDE_POST', data: JSON.stringify({ postId: createdPosts[6].id, reason: 'Toxic' }), ip: '192.168.1.25', level: 'WARN', created_at: new Date(now - 2 * oneDay) },
            { userId: users['spammer_bot'].id, action: 'REGISTER', ip: '14.155.22.11', level: 'INFO', created_at: new Date(now - 7 * oneDay) },
            { userId: users['admin'].id, action: 'BAN_USER', data: JSON.stringify({ targetUser: 'spammer_bot', reason: 'Spam' }), ip: '192.168.1.1', level: 'WARN', created_at: new Date(now - 2 * oneDay) },
            { userId: users['newbie_coder'].id, action: 'CREATE_POST', data: JSON.stringify({ postId: createdPosts[0].id }), ip: '10.0.0.5', level: 'INFO', created_at: new Date(now - 5 * oneDay) },
        ]);

        // 8. Create Banned Words
        console.log('Seeding Banned Words...');
        await BannedWord.bulkCreate([
            { word: 'scam' },
            { word: 'lừa đảo' },
            { word: 'bet88' },
            { word: 'nhà cái' }
        ]);

        console.log('\n================================================');
        console.log('SEEDING COMPLETED SUCCESSFULLY!');
        console.log('================================================');
        console.log('Login Credentials (Password: 12345678):');
        console.log('1. Admin:       admin@gmail.com');
        console.log('2. Moderator:   mod@gmail.com');
        console.log('3. Dev Guru:    dev@gmail.com     (High rep user)');
        console.log('4. Newbie:      new@gmail.com     (Standard user)');
        console.log('5. Drama:       drama@gmail.com   (User with issues)');
        console.log('6. Spammer:     spam@gmail.com    (Banned)');
        console.log('================================================');

        process.exit(0);
    } catch (error) {
        console.error('SEED ERROR:', error);
        process.exit(1);
    }
};

run();
