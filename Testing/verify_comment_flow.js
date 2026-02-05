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
// Mock /api/comments route, auth middleware inside verifies token
app.use('/api/comments', commentRoute);

const createToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
};

let user1, user2, post, category;
const timestamp = Date.now();

async function setupData() {
    await sequelize.sync({ alter: true });

    // Users
    user1 = await User.create({
        username: `cmter1_${timestamp}`,
        email: `cmter1_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    user2 = await User.create({
        username: `cmter2_${timestamp}`,
        email: `cmter2_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    // Post
    category = await Category.create({ name: `CmtCat_${timestamp}`, description: 'Comment Test' });
    post = await PostRepository.create({
        title: 'Post for comments',
        content: 'Discuss here',
        user_id: user1.id,
        category_id: category.id,
        status: 'active'
    });
}

async function runTests() {
    try {
        console.log('--- SETUP COMMENT TEST DATA ---');
        await setupData();

        const token1 = createToken(user1.id, user1.role);
        const token2 = createToken(user2.id, user2.role);

        console.log('--- START COMMENT FLOW TEST ---');

        // 1. Create Root Comment
        console.log('1. User1 create Root Comment...');
        const resRoot = await request(app)
            .post('/api/comments')
            .set('Authorization', `Bearer ${token1}`)
            .send({ postId: post.id, content: 'This is a root comment' });

        let rootId;
        if (resRoot.status === 201) {
            rootId = resRoot.body.data.id;
            console.log('   ✅ Active comment created.');
        } else {
            throw new Error(`Create Root Failed: ${resRoot.status} - ${JSON.stringify(resRoot.body)}`);
        }

        // 2. Create Reply
        console.log('2. User2 replies to Root Comment...');
        const resReply = await request(app)
            .post('/api/comments')
            .set('Authorization', `Bearer ${token2}`)
            .send({ postId: post.id, content: 'This is a reply', parentId: rootId });

        if (resReply.status === 201) {
            console.log('   ✅ Reply created.');
        } else {
            throw new Error('Create Reply Failed');
        }

        // 3. Create Badword Comment
        console.log('3. User1 creates Badword Comment...');
        const resBad = await request(app)
            .post('/api/comments')
            .set('Authorization', `Bearer ${token1}`)
            .send({ postId: post.id, content: 'This content contains spam' });
        
        // Note: ModerationService hardcoded ['badword', 'vi phạm', 'cấm', 'spam']
        // Input contains "spam" -> Should be pending
        
        if (resBad.status === 201 && resBad.body.data.status === 'pending') {
            console.log('   ✅ Comment flagged as PENDING.');
        } else {
            throw new Error('Moderation Failed or Status incorrect: ' + resBad.body.data.status);
        }

        // 4. Verify Tree Structure
        console.log('4. Get Comments Tree (Public)...');
        const resTree = await request(app).get(`/api/comments/post/${post.id}`);
        
        if (resTree.status === 200) {
            const roots = resTree.body.data;
            console.log(`   Fetched ${roots.length} root comments.`);
            
            // Expect: 1 Root (Active), Badword is Pending so usually not fetched or fetched but handled by frontend?
            // UseCase getCommentsByPost only fetches status='active' in Repository.
            // So we expect 1 root. The badword one is hidden.
            
            if (roots.length === 1) {
                const root = roots[0];
                if (root.id === rootId && root.replies.length === 1) {
                    console.log('   ✅ Tree structure verified: Root has 1 reply.');
                } else {
                    console.error('Tree Root:', JSON.stringify(root, null, 2));
                    throw new Error('Tree structure mismatch.');
                }
            } else {
                throw new Error(`Expected 1 root comment, found ${roots.length}`);
            }
        } else {
            throw new Error('Get Tree Failed');
        }

        // 5. Verify Post Comment Count
        console.log('5. Verify Post Comment Count...');
        const updatedPost = await Post.findByPk(post.id);
        // Expect 2 active comments (Root + Reply)
        if (updatedPost.comment_count === 2) {
             console.log('   ✅ Comment count updated correctly (2).');
        } else {
             throw new Error(`Comment count mismatch: ${updatedPost.comment_count}`);
        }

        console.log('--- ✅ COMMENT FLOW TEST PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
