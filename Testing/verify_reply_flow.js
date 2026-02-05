const path = require('path');
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import Modules
const sequelize = require('../Server/src/config/database');
const commentRoute = require('../Server/src/routes/comment.route');
const postRoute = require('../Server/src/routes/post.route'); // For route mounting consistency if needed
const PostRepository = require('../Server/src/repositories/post.repository');
const Category = require('../Server/src/models/category.model');
const User = require('../Server/src/models/user.model');
const Post = require('../Server/src/models/post.model');
const Comment = require('../Server/src/models/comment.model');
const ROLES = require('../Server/src/constants/roles');

// Setup App
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/comments', commentRoute);

const createToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
};

let user1, user2, post, activeComment, hiddenComment;
const timestamp = Date.now();

async function setupData() {
    await sequelize.sync({ alter: true });

    // Users
    user1 = await User.create({
        username: `reply_user1_${timestamp}`,
        email: `reply_user1_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    user2 = await User.create({
        username: `reply_user2_${timestamp}`,
        email: `reply_user2_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    // Post
    const category = await Category.create({ name: `ReplyCat_${timestamp}`, description: 'Reply Test' });
    post = await PostRepository.create({
        title: 'Post for reply testing',
        content: 'Reply discussion',
        user_id: user1.id,
        category_id: category.id,
        status: 'active'
    });

    // Active Root Comment
    activeComment = await Comment.create({
        user_id: user1.id,
        post_id: post.id,
        content: 'This is active root',
        status: 'active'
    });

    // Hidden Root Comment
    hiddenComment = await Comment.create({
        user_id: user1.id,
        post_id: post.id,
        content: 'This is hidden root',
        status: 'hidden'
    });
}

async function runTests() {
    try {
        console.log('--- SETUP REPLY TEST DATA ---');
        await setupData();
        const token2 = createToken(user2.id, user2.role);

        console.log('--- START REPLY FLOW TEST ---');

        // 1. Reply to Active Comment (Success)
        console.log('1. Reply to ACTIVE comment...');
        const resSuccess = await request(app)
            .post('/api/comments/reply')
            .set('Authorization', `Bearer ${token2}`)
            .send({ 
                postId: post.id, 
                parentCommentId: activeComment.id, 
                content: 'Valid Reply' 
            });

        if (resSuccess.status === 201) {
            console.log('   ✅ Reply thành công.');
            if (resSuccess.body.data.parentId === activeComment.id) {
                 console.log('   ✅ ParentID liên kết đúng.');
            } else {
                 throw new Error('ParentID mismatch');
            }
        } else {
            throw new Error(`Reply Active Failed: ${resSuccess.status} - ${JSON.stringify(resSuccess.body)}`);
        }

        // 2. Reply to Hidden Comment (Fail)
        console.log('2. Reply to HIDDEN comment (Expect Fail)...');
        const resFail = await request(app)
            .post('/api/comments/reply')
            .set('Authorization', `Bearer ${token2}`)
            .send({ 
                postId: post.id, 
                parentCommentId: hiddenComment.id, 
                content: 'Should fail' 
            });

        if (resFail.status === 400) { // UseCase throws status 400 for unavailable parent
            console.log('   ✅ Bị chặn đúng mong đợi (400 Bad Request).');
            console.log('   Message:', resFail.body.message);
        } else {
            throw new Error(`Should fail but got status: ${resFail.status}`);
        }

        // 3. Reply to Non-existent Comment (Fail)
        console.log('3. Reply to NON-EXISTENT comment...');
        const resNotFound = await request(app)
            .post('/api/comments/reply')
            .set('Authorization', `Bearer ${token2}`)
            .send({ 
                postId: post.id, 
                parentCommentId: 999999, 
                content: 'Ghost reply' 
            });
            
        if (resNotFound.status === 404) {
            console.log('   ✅ Bị chặn đúng mong đợi (404 Not Found).');
        } else {
            throw new Error(`Should 404 but got: ${resNotFound.status}`);
        }

        console.log('--- ✅ REPLY FLOW TEST PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
