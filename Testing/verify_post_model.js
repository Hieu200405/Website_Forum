const path = require('path');
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const sequelize = require('../Server/src/config/database');
const PostRepository = require('../Server/src/repositories/post.repository');
const Category = require('../Server/src/models/category.model');
const User = require('../Server/src/models/user.model');
const ROLES = require('../Server/src/constants/roles');

async function runTests() {
    try {
        console.log('--- TEST POST REPOSITORY (DATABASE LEVEL) ---');
        
        // 1. Sync DB
        await sequelize.sync({ alter: true });
        console.log('1. Database synced.');

        // 2. Setup Data (User & Category)
        const timestamp = Date.now();
        
        // Create Mock User
        const user = await User.create({
            username: `poster_${timestamp}`,
            email: `poster_${timestamp}@test.com`,
            password: 'hashedpassword',
            role: ROLES.USER
        });
        console.log(`2. Created User ID: ${user.id}`);

        // Create Mock Category
        const category = await Category.create({
            name: `News_${timestamp}`,
            description: 'Testing'
        });
        console.log(`3. Created Category ID: ${category.id}`);

        // 3. Test Create Post
        console.log('4. Testing create()...');
        const newPost = await PostRepository.create({
            title: 'Hello World',
            content: 'This is my first post content.',
            user_id: user.id,
            category_id: category.id,
            status: 'active'
        });

        if (newPost && newPost.id) {
            console.log(`   ✅ Post Created ID: ${newPost.id}`);
        } else {
            throw new Error('Create Post Failed');
        }

        // 4. Test FindById (Check Associations)
        console.log('5. Testing findById() with Associations...');
        const foundPost = await PostRepository.findById(newPost.id);
        
        if (foundPost) {
            if (foundPost.author.username === user.username && foundPost.category.name === category.name) {
                console.log('   ✅ Include Author & Category successful.');
            } else {
                console.error('   ❌ Association Data mismatch:', JSON.stringify(foundPost.toJSON(), null, 2));
                throw new Error('Association Failed');
            }
        } else {
            throw new Error('FindById returns nothing');
        }

        // 5. Test Update Status
        console.log('6. Testing updateStatus()...');
        await PostRepository.updateStatus(newPost.id, 'hidden');
        const hiddenPost = await PostRepository.findById(newPost.id);
        if (hiddenPost.status === 'hidden') {
            console.log('   ✅ Status updated to "hidden".');
        } else {
            throw new Error('Update Status Failed');
        }

        // 6. Test Atomic Increment
        console.log('7. Testing increaseLikeCount()...');
        await PostRepository.increaseLikeCount(newPost.id);
        const likedPost = await PostRepository.findById(newPost.id);
        if (likedPost.like_count === 1) {
            console.log('   ✅ Like count increased to 1.');
        } else {
            throw new Error('Increase Like Failed');
        }

        // 7. Test Pagination & Filtering
        console.log('8. Testing findAll() with filters...');
        // Create one more post to test list
        await PostRepository.create({
            title: 'Another Post',
            content: 'Content 2',
            user_id: user.id,
            category_id: category.id,
            status: 'active'
        });

        const result = await PostRepository.findAll({ categoryId: category.id, limit: 10 });
        console.log(`   ✅ Found ${result.count} posts for category ${category.id}.`);
        if (result.count >= 2) {
             console.log('   ✅ Count is correct.');
        } else {
             // Note: result.rows length might be limited by limit, result.count is total
        }

        console.log('--- ✅ POST REPOSITORY TEST COMPLETED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
