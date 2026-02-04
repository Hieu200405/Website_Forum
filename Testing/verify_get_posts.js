const path = require('path');
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Import App Modules
const sequelize = require('../Server/src/config/database');
const postRoute = require('../Server/src/routes/post.route');
const Post = require('../Server/src/models/post.model');
const Category = require('../Server/src/models/category.model');
const User = require('../Server/src/models/user.model');
const ROLES = require('../Server/src/constants/roles');
const PostRepository = require('../Server/src/repositories/post.repository');

// Setup mock app
const app = express();
app.use(cors());
app.use(express.json());

// Mock Auth Middleware for Create Post if needed, but we are testing GET public
// However, creating seed data directly via DB is faster.
app.use('/api/posts', postRoute);

let user, category;
const timestamp = Date.now();

async function setupData() {
    await sequelize.sync({ alter: true });

    // 1. Create User
    user = await User.create({
        username: `viewer_${timestamp}`,
        email: `viewer_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    // 2. Create Category
    category = await Category.create({
        name: `ViewCat_${timestamp}`,
        description: 'For viewing'
    });

    // 3. Create Bulk Posts
    // Post 1: Oldest, 0 likes
    await PostRepository.create({
        title: 'Post 1 Oldest',
        content: 'Content 1',
        user_id: user.id,
        category_id: category.id,
        status: 'active',
        like_count: 0
    });
    // Manual Delay or set created_at? Sequelize auto sets createdAt.
    // To test sorting, we need slight delay or ensure insertion order? 
    // Usually insertion order works for ID, but let's sleep 10ms
    await new Promise(r => setTimeout(r, 10));

    // Post 2: Middle, 100 likes
    await PostRepository.create({
        title: 'Post 2 Popular',
        content: 'Content 2',
        user_id: user.id,
        category_id: category.id,
        status: 'active',
        like_count: 100
    });
    
    await new Promise(r => setTimeout(r, 10));

    // Post 3: Newest, 5 likes
    await PostRepository.create({
        title: 'Post 3 Newest',
        content: 'Content 3',
        user_id: user.id,
        category_id: category.id,
        status: 'active',
        like_count: 5
    });

    // Post 4: Hidden (Should not appear)
    await PostRepository.create({
        title: 'Post 4 Hidden',
        content: 'Hidden content',
        user_id: user.id,
        category_id: category.id,
        status: 'hidden'
    });
}

async function runTests() {
    try {
        console.log('--- SETUP DATA ---');
        await setupData();
        console.log('--- START TEST GET POSTS ---');

        // 1. Test Default (Newest)
        console.log('1. Test Default Sort (Newest)...');
        const resNewest = await request(app).get('/api/posts?categoryId=' + category.id);
        
        if (resNewest.status === 200) {
            const posts = resNewest.body.data.posts;
            console.log(`   Fetched ${posts.length} posts.`);
            if (posts.length === 3) {
                 if (posts[0].title === 'Post 3 Newest' && posts[2].title === 'Post 1 Oldest') {
                     console.log('   ✅ Sort by Newest is correct.');
                 } else {
                     throw new Error('Sort Newest Failed: ' + posts.map(p => p.title).join(', '));
                 }
            } else {
                 throw new Error(`Expected 3 active posts, got ${posts.length}`);
            }
        }

        // 2. Test Sort by Most Liked
        console.log('2. Test Sort by Most Liked...');
        const resLiked = await request(app).get(`/api/posts?categoryId=${category.id}&sortBy=mostLiked`);
        if (resLiked.status === 200) {
            const posts = resLiked.body.data.posts;
            if (posts[0].likes === 100 && posts[1].likes === 5) {
                console.log('   ✅ Sort by Most Liked is correct.');
            } else {
                throw new Error('Sort Liked Failed: ' + posts.map(p => `${p.title}(${p.likes})`).join(', '));
            }
        }

        // 3. Test Pagination
        console.log('3. Test Pagination (Limit 1)...');
        const resPage = await request(app).get(`/api/posts?categoryId=${category.id}&limit=1&page=1`);
        if (resPage.status === 200) {
            const data = resPage.body.data;
            if (data.posts.length === 1 && data.total === 3 && data.totalPages === 3) {
                console.log('   ✅ Pagination correct (1 post/page, total 3).');
            } else {
                 throw new Error('Pagination Failed');
            }
        }

        // 4. Test Hidden Status
        console.log('4. Test Visibility (Hidden posts)...');
        // We already checked count is 3, while we inserted 4 (1 hidden). So this is effectively passed.
        // Double check
        const allPosts = resNewest.body.data.posts;
        const hiddenFound = allPosts.find(p => p.title.includes('Hidden'));
        if (!hiddenFound) {
            console.log('   ✅ Hidden posts are NOT shown.');
        } else {
            throw new Error('Hidden post is visible!');
        }

        console.log('--- ✅ TEST GET POSTS SUCCESSFUL ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
