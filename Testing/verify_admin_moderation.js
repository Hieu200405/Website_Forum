const path = require('path');
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import Modules
const serverSrc = path.join(__dirname, '../Server/src');
const sequelize = require(path.join(serverSrc, 'config/database'));
const adminRoute = require(path.join(serverSrc, 'routes/admin.route'));
const moderationRoute = require(path.join(serverSrc, 'routes/moderation.route'));
const User = require(path.join(serverSrc, 'models/user.model'));
const Post = require(path.join(serverSrc, 'models/post.model'));
const ROLES = require(path.join(serverSrc, 'constants/roles'));

// Setup App
const app = express();
app.use(cors());
app.use(express.json());
// Mock route mounting
app.use('/api/admin', adminRoute);
app.use('/api/moderation', moderationRoute);


const createToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
};

let admin, moderator, normalUser, userToBan, postToModerate;
const timestamp = Date.now();

async function setupData() {
    await sequelize.sync({ alter: true });

    // 1. Create Users
    admin = await User.create({
        username: `admin_${timestamp}`,
        email: `admin_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.ADMIN
    });

    moderator = await User.create({
        username: `mod_${timestamp}`,
        email: `mod_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.MODERATOR
    });

    normalUser = await User.create({
        username: `user_${timestamp}`,
        email: `user_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    userToBan = await User.create({
        username: `evil_${timestamp}`,
        email: `evil_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    // 2. Create Post
    // Fix: Post model requires category_id and user_id. 
    // We assume a category exists or create one if needed, but for simplicity let's link to user.
    // Wait, Post model has constraints. We need a category.
    const Category = require(path.join(serverSrc, 'models/category.model')); // Lazy load
    let cat = await Category.findOne(); 
    if (!cat) {
        cat = await Category.create({ name: 'General', description: 'Test' });
    }

    postToModerate = await Post.create({
        title: 'Toxic Post',
        content: 'This should be hidden',
        user_id: normalUser.id,
        category_id: cat.id,
        status: 'active'
    });
}

async function runTests() {
    try {
        console.log('--- SETUP ADMIN & MODERATION TEST DATA ---');
        await setupData();
        const adminToken = createToken(admin.id, admin.role);
        const modToken = createToken(moderator.id, moderator.role);
        // Token for user to ban (to test login block)
        const userToBanToken = createToken(userToBan.id, userToBan.role); 

        console.log('\n--- 1. TEST BAN USER (ADMIN) ---');
        
        // Admin Bans User
        const resBan = await request(app)
            .patch(`/api/admin/users/${userToBan.id}/ban`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ reason: 'Spamming' });
        
        if (resBan.status === 200) {
            console.log('   ✅ Ban User thành công.');
        } else {
            throw new Error(`Ban Failed: ${resBan.status} - ${JSON.stringify(resBan.body)}`);
        }

        // Verify DB
        const bannedUser = await User.findByPk(userToBan.id);
        if (bannedUser.status === 'banned' && bannedUser.banned_reason === 'Spamming') {
             console.log('   ✅ DB Updated: Status=banned, Reason=Spamming');
        } else {
             throw new Error('DB Verify Failed');
        }

        console.log('\n--- 2. TEST UNBAN USER (ADMIN) ---');
        
        // Admin Unbans User
        const resUnban = await request(app)
            .patch(`/api/admin/users/${userToBan.id}/unban`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        if (resUnban.status === 200) {
             console.log('   ✅ Unban User thành công.');
        } else {
             throw new Error(`Unban Failed: ${resUnban.status}`);
        }

        // Verify DB
        await bannedUser.reload();
        if (bannedUser.status === 'active') {
             console.log('   ✅ DB Updated: Status=active');
        } else {
             throw new Error('Unban DB Verify Failed');
        }

        console.log('\n--- 3. TEST MODERATE POST (MODERATOR) ---');

        // Moderator Hides Post
        const resHide = await request(app)
            .patch(`/api/moderation/posts/${postToModerate.id}`)
            .set('Authorization', `Bearer ${modToken}`)
            .send({ action: 'hide', reason: 'Inappropriate content' });
        
        if (resHide.status === 200) {
             console.log('   ✅ Moderator ẩn bài viết thành công.');
        } else {
             throw new Error(`Moderate Hide Failed: ${resHide.status}`);
        }

        // Verify DB
        const hiddenPost = await Post.findByPk(postToModerate.id);
        if (hiddenPost.status === 'hidden' && hiddenPost.hide_reason === 'Inappropriate content') {
             console.log('   ✅ DB Updated: Status=hidden, Reason=Inappropriate content');
        } else {
             throw new Error('Moderate DB Verify Failed');
        }

        // Moderator Approves Post
        const resApprove = await request(app)
            .patch(`/api/moderation/posts/${postToModerate.id}`)
            .set('Authorization', `Bearer ${modToken}`)
            .send({ action: 'approve' });

        if (resApprove.status === 200) {
             console.log('   ✅ Moderator duyệt bài viết thành công.');
        } else {
             throw new Error(`Moderate Approve Failed: ${resApprove.status}`);
        }
        
        await hiddenPost.reload();
        if (hiddenPost.status === 'active') {
             console.log('   ✅ DB Updated: Status=active');
        }

        console.log('\n--- 4. TEST SECURITY (Normal User -> Admin Route) ---');
        // Normal User tries to access Admin route
        const normalToken = createToken(normalUser.id, normalUser.role);
        const resAccess = await request(app)
            .patch(`/api/admin/users/${userToBan.id}/ban`)
            .set('Authorization', `Bearer ${normalToken}`)
            .send({ reason: 'Hacking' });
        
        if (resAccess.status === 403) {
             console.log('   ✅ Role Middleware chặn User thường thành công (403).');
        } else {
             throw new Error(`Security Check Failed: Got ${resAccess.status}`);
        }


        console.log('\n--- ✅ ADMIN & MODERATION TEST SUITE PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
