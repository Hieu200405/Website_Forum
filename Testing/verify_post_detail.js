const path = require('path');
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import App Modules
const sequelize = require('../Server/src/config/database');
const postRoute = require('../Server/src/routes/post.route');
const Post = require('../Server/src/models/post.model');
const Category = require('../Server/src/models/category.model');
const User = require('../Server/src/models/user.model');
const Comment = require('../Server/src/models/comment.model');
const ROLES = require('../Server/src/constants/roles');
const PostRepository = require('../Server/src/repositories/post.repository');

// Setup mock app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/posts', postRoute);

// Helper Token
const createToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '1h' }
    );
};

let author, admin, category;
let activePost, hiddenPost;
const timestamp = Date.now();

async function setupData() {
    await sequelize.sync({ alter: true });

    // 1. Create Users
    author = await User.create({
        username: `author_${timestamp}`,
        email: `author_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    admin = await User.create({
        username: `admin_post_${timestamp}`,
        email: `admin_post_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.ADMIN
    });

    // 2. Create Category
    category = await Category.create({
        name: `DetailCat_${timestamp}`,
        description: 'Detail testing'
    });

    // 3. Create Posts
    // Active Post
    activePost = await PostRepository.create({
        title: 'Active Post Detail',
        content: 'Content detail',
        user_id: author.id,
        category_id: category.id,
        status: 'active'
    });

    // Hidden Post (Pending/Hidden)
    hiddenPost = await PostRepository.create({
        title: 'Hidden Post Detail',
        content: 'Secret content',
        user_id: author.id,
        category_id: category.id,
        status: 'hidden'
    });

    // 4. Create Comment for Active Post
    await Comment.create({
        content: 'Nice post!',
        user_id: admin.id, // Admin comments
        post_id: activePost.id,
        status: 'active'
    });
}

async function runTests() {
    try {
        console.log('--- SETUP DATA ---');
        await setupData();

        console.log('--- TEST GET POST DETAIL ---');

        // 1. Test Guest View Active Post (Should Success)
        console.log('1. Guest xem bài Active...');
        const resGuest = await request(app).get(`/api/posts/${activePost.id}`);
        if (resGuest.status === 200) {
            console.log('   ✅ Guest xem thành công.');
            if (resGuest.body.data.comments.length > 0) {
                 console.log('   ✅ Đã load được comments kèm theo.');
            } else {
                 throw new Error('Không load được comments.');
            }
        } else {
            throw new Error(`Guest view failed: ${resGuest.status}`);
        }

        // 2. Test Guest View Hidden Post (Should Fail 403 or 404)
        console.log('2. Guest xem bài Hidden (Expect 403)...');
        const resGuestHidden = await request(app).get(`/api/posts/${hiddenPost.id}`);
        if (resGuestHidden.status === 403) {
            console.log('   ✅ Guest bị chặn truy cập (403 Forbidden).');
        } else {
            throw new Error(`Guest should not see hidden post. Status: ${resGuestHidden.status}`);
        }

        // 3. Test Author View Own Hidden Post (Should Success)
        console.log('3. Author xem bài Hidden của chính mình...');
        const authorToken = createToken(author.id, author.role);
        const resAuthor = await request(app)
            .get(`/api/posts/${hiddenPost.id}`)
            .set('Authorization', `Bearer ${authorToken}`);
        
        if (resAuthor.status === 200) {
            console.log('   ✅ Author xem được bài ẩn của mình.');
        } else {
            throw new Error(`Author view failed: ${resAuthor.status}`);
        }

        // 4. Test Admin View Any Hidden Post (Should Success)
        console.log('4. Admin xem bài Hidden của người khác...');
        const adminToken = createToken(admin.id, admin.role);
        const resAdmin = await request(app)
            .get(`/api/posts/${hiddenPost.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        if (resAdmin.status === 200) {
            console.log('   ✅ Admin xem được bài ẩn.');
        } else {
            throw new Error(`Admin view failed: ${resAdmin.status}`);
        }

        console.log('--- ✅ TEST POST DETAIL SUCCESSFUL ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
