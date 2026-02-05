const path = require('path');
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import Modules
// Use path.join to avoid issues
const serverSrc = path.join(__dirname, '../Server/src');
const sequelize = require(path.join(serverSrc, 'config/database'));
const postRoute = require(path.join(serverSrc, 'routes/post.route'));
const User = require(path.join(serverSrc, 'models/user.model'));
const Post = require(path.join(serverSrc, 'models/post.model'));
const Category = require(path.join(serverSrc, 'models/category.model'));
const Report = require(path.join(serverSrc, 'models/report.model'));
const ROLES = require(path.join(serverSrc, 'constants/roles'));

// Setup App
const app = express();
app.use(cors());
app.use(express.json());
// Mock verify middleware simply if relying on default behaviour, 
// but since postRoute uses authMiddleware, we set it up to accept valid tokens.
// For Post Route, we mount at /api/posts
app.use('/api/posts', postRoute);

const createToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
};

let author, reporter, post;
const timestamp = Date.now();

async function setupData() {
    await sequelize.sync({ alter: true });

    author = await User.create({
        username: `rep_auth_${timestamp}`,
        email: `rep_auth_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    reporter = await User.create({
        username: `reporter_${timestamp}`,
        email: `reporter_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    const category = await Category.create({ name: `RepCat_${timestamp}`, description: 'Report Test' });
    
    post = await Post.create({
        title: 'Post to be reported',
        content: 'Bad content maybe?',
        user_id: author.id,
        category_id: category.id,
        status: 'active'
    });
}

async function runTests() {
    try {
        console.log('--- SETUP REPORT TEST DATA ---');
        await setupData();
        const reporterToken = createToken(reporter.id, reporter.role);

        console.log('--- START REPORT FLOW TEST ---');

        // 1. Valid Report
        console.log('1. Reporter reports post...');
        const resReport = await request(app)
            .post(`/api/posts/${post.id}/report`)
            .set('Authorization', `Bearer ${reporterToken}`)
            .send({ reason: 'Spam content detected' });

        if (resReport.status === 201) {
            console.log('   ✅ Report thành công.');
        } else {
            throw new Error(`Report Failed: ${resReport.status} - ${JSON.stringify(resReport.body)}`);
        }

        // 2. Duplicate Report Check
        console.log('2. Reporter tries to report again...');
        const resDup = await request(app)
            .post(`/api/posts/${post.id}/report`)
            .set('Authorization', `Bearer ${reporterToken}`)
            .send({ reason: 'Spam again' });
        
        if (resDup.status === 409) {
            console.log('   ✅ Chặn trùng lặp thành công (409).');
        } else {
            throw new Error(`Duplicate Check Failed: ${resDup.status}`);
        }

        // 3. Auto-Hide Logic (> 5 reports)
        console.log('3. Simulate mass reporting to trigger Auto-Hide...');
        // Create 5 dummy users to report
        for (let i = 0; i < 5; i++) {
            const bot = await User.create({
                username: `bot_${i}_${timestamp}`,
                email: `bot_${i}_${timestamp}@test.com`,
                password: 'pass',
                role: ROLES.USER
            });
            const botToken = createToken(bot.id, bot.role);
            
            await request(app)
                .post(`/api/posts/${post.id}/report`)
                .set('Authorization', `Bearer ${botToken}`)
                .send({ reason: 'Mass report' });
        }
        
        // Check Post Status
        const updatedPost = await Post.findByPk(post.id);
        console.log(`   Current Post Status: ${updatedPost.status}`);
        
        if (updatedPost.status === 'hidden') {
            console.log('   ✅ Auto-Hide hoạt động (Post status -> hidden).');
        } else {
            // Count reports
            const totalReports = await Report.count({ where: { post_id: post.id } });
            console.log(`   Total reports: ${totalReports}`);
            throw new Error(`Auto-Hide Failed. Expected 'hidden', got '${updatedPost.status}'`);
        }

        console.log('--- ✅ REPORT FLOW TEST PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
