const path = require('path');
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import Modules
const sequelize = require('../Server/src/config/database');
const postRoute = require('../Server/src/routes/post.route'); // Post route contains like endpoints
const PostRepository = require('../Server/src/repositories/post.repository');
const Category = require('../Server/src/models/category.model');
const User = require('../Server/src/models/user.model');
const Post = require('../Server/src/models/post.model');
const Like = require('../Server/src/models/like.model');
const ROLES = require('../Server/src/constants/roles');

// Setup App
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/posts', postRoute); // Mount at /api/posts

const createToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
};

let user, post;
const timestamp = Date.now();

async function setupData() {
    await sequelize.sync({ alter: true });

    // User
    user = await User.create({
        username: `li_user_${timestamp}`,
        email: `li_user_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    // Post
    const category = await Category.create({ name: `LikeCat_${timestamp}`, description: 'Like Test' });
    post = await PostRepository.create({
        title: 'Post for like testing',
        content: 'Like discussion',
        user_id: user.id,
        category_id: category.id,
        status: 'active'
    });
}

async function runTests() {
    try {
        console.log('--- SETUP LIKE TEST DATA ---');
        await setupData();
        const token = createToken(user.id, user.role);

        console.log('--- START LIKE FLOW TEST ---');

        // 1. Test Like Post
        console.log('1. User likes Post...');
        const resLike = await request(app)
            .post(`/api/posts/${post.id}/like`)
            .set('Authorization', `Bearer ${token}`);

        if (resLike.status === 200) {
            console.log('   ✅ Like thành công.');
        } else {
            throw new Error(`Like Failed: ${resLike.status} - ${JSON.stringify(resLike.body)}`);
        }

        // 2. Verify Like Count & Duplicate Check
        console.log('2. Verify Count & Duplicate Like...');
        const updatedPostLike = await Post.findByPk(post.id);
        if (updatedPostLike.like_count === 1) {
            console.log('   ✅ Post like_count increased to 1.');
        } else {
            throw new Error(`Count mismatch: ${updatedPostLike.like_count}`);
        }

        const resDup = await request(app)
            .post(`/api/posts/${post.id}/like`)
            .set('Authorization', `Bearer ${token}`);
        
        if (resDup.status === 409) {
            console.log('   ✅ Duplicate Like blocked (409 Conflict).');
        } else {
            throw new Error(`Duplicate Check Failed: ${resDup.status}`);
        }

        // 3. Test Unlike Post
        console.log('3. User unlikes Post...');
        const resUnlike = await request(app)
            .delete(`/api/posts/${post.id}/like`)
            .set('Authorization', `Bearer ${token}`);
        
        if (resUnlike.status === 200) {
            console.log('   ✅ Unlike thành công.');
        } else {
            throw new Error(`Unlike Failed: ${resUnlike.status}`);
        }

        // 4. Verify Unlike Count & Repeat Unlike
        console.log('4. Verify Count & Repeat Unlike...');
        const updatedPostUnlike = await Post.findByPk(post.id);
        if (updatedPostUnlike.like_count === 0) {
             console.log('   ✅ Post like_count decreased to 0.');
        } else {
             throw new Error(`Count mismatch after unlike: ${updatedPostUnlike.like_count}`);
        }

        const resRepUnlike = await request(app)
            .delete(`/api/posts/${post.id}/like`)
            .set('Authorization', `Bearer ${token}`);
        
        if (resRepUnlike.status === 404) {
             console.log('   ✅ Repeat Unlike blocked (404 Not Found).');
        } else {
             throw new Error(`Repeat Unlike Failed: ${resRepUnlike.status}`);
        }

        console.log('--- ✅ LIKE FLOW TEST PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
