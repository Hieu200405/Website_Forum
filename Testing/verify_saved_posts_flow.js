const path = require('path');
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import Modules
const sequelize = require('../Server/src/config/database');
const postRoute = require('../Server/src/routes/post.route'); 
const PostRepository = require('../Server/src/repositories/post.repository');
const Category = require('../Server/src/models/category.model');
const User = require('../Server/src/models/user.model');
const Post = require('../Server/src/models/post.model');
const SavedPost = require('../Server/src/models/savedPost.model');
const ROLES = require('../Server/src/constants/roles');

// Setup App
const app = express();
app.use(cors());
app.use(express.json());
// Error Handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message });
});
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
        username: `save_user_${timestamp}`,
        email: `save_user_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    // Post
    const category = await Category.create({ name: `SaveCat_${timestamp}`, description: 'Save Test' });
    post = await PostRepository.create({
        title: 'Post for save testing',
        content: 'Save discussion',
        user_id: user.id,
        category_id: category.id,
        status: 'active'
    });
}

async function runTests() {
    try {
        console.log('--- SETUP SAVED POST TEST DATA ---');
        await setupData();
        const token = createToken(user.id, user.role);

        console.log('--- START SAVED POST FLOW TEST ---');

        // 1. Test Save Post
        console.log('1. User saves Post...');
        const resSave = await request(app)
            .post(`/api/posts/${post.id}/save`)
            .set('Authorization', `Bearer ${token}`);

        if (resSave.status === 200) {
            console.log('   ✅ Save thành công.');
        } else {
            throw new Error(`Save Failed: ${resSave.status} - ${JSON.stringify(resSave.body)}`);
        }

        // 2. Test Duplicate Save
        console.log('2. Verify Duplicate Save...');
        const resSaveDup = await request(app)
            .post(`/api/posts/${post.id}/save`)
            .set('Authorization', `Bearer ${token}`);

        if (resSaveDup.status === 409 || resSaveDup.status === 400) {
            console.log('   ✅ Duplicate Save blocked.');
        } else {
            throw new Error(`Duplicate Save Check Failed: ${resSaveDup.status}`);
        }

        // 3. Test Get Saved Posts
        console.log('3. Get Saved Posts list...');
        const resGetSaved = await request(app)
            .get(`/api/posts/saved`)
            .set('Authorization', `Bearer ${token}`);

        if (resGetSaved.status === 200 && resGetSaved.body.data.length > 0) {
            console.log('   ✅ Get Saved Posts list ok. Array length: ', resGetSaved.body.data.length);
        } else {
            throw new Error(`Get Saved Posts Failed: ${resGetSaved.status}`);
        }

        // 4. Test Unsave Post
        console.log('4. User unsaves Post...');
        const resUnsave = await request(app)
            .delete(`/api/posts/${post.id}/save`)
            .set('Authorization', `Bearer ${token}`);
        
        if (resUnsave.status === 200) {
            console.log('   ✅ Unsave thành công.');
        } else {
            throw new Error(`Unsave Failed: ${resUnsave.status}`);
        }

        // 5. Verify Unsave and empty list
        console.log('5. Verify list is empty after unsave...');
        const resGetEmptyList = await request(app)
            .get(`/api/posts/saved`)
            .set('Authorization', `Bearer ${token}`);

        if (resGetEmptyList.status === 200 && resGetEmptyList.body.data.length === 0) {
             console.log('   ✅ Get Saved Posts list is empty.');
        } else {
             throw new Error(`Get Saved Posts Failed after unsave: ${resGetEmptyList.status}`);
        }

        console.log('--- ✅ SAVED POST FLOW TEST PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
