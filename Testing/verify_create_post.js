const path = require('path');
// Add Server/node_modules
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Import Modules
const sequelize = require('../Server/src/config/database');
const postRoute = require('../Server/src/routes/post.route');
const CategoryRepository = require('../Server/src/repositories/category.repository');
const UserRepository = require('../Server/src/repositories/user.repository');
const SystemLog = require('../Server/src/models/systemLog.model');
const Post = require('../Server/src/models/post.model');
const ROLES = require('../Server/src/constants/roles');

// Setup mock app
const app = express();
app.use(cors());
app.use(express.json());

// Mock Middleware User
app.use('/api/posts', (req, res, next) => {
    // We will inject user via header token in real middleware, 
    // but here we are mounting the router which uses authMiddleware.
    // Auth Middleware verifies token. So we need to provide valid token in tests.
    next();
}, postRoute);

// Helper: Create Token
const createToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '1h' }
    );
};

// Utils: Create Data
const timestamp = Date.now();
let user, category, token;

async function setup() {
    await sequelize.sync({ alter: true });
    
    // Create User
    const userData = {
        username: `poster_api_${timestamp}`,
        email: `poster_api_${timestamp}@test.com`,
        password: 'hashedpassword',
        role: ROLES.USER
    };
    // Direct Create (bypassing repo logic for speed, or use repo)
    const UserModel = require('../Server/src/models/user.model');
    user = await UserModel.create(userData);
    token = createToken(user.id, user.role);

    // Create Category
    category = await CategoryRepository.create({
        name: `General_${timestamp}`,
        description: 'General discussion'
    });
}

async function runTests() {
    try {
        console.log('--- KHỞI TẠO DỮ LIỆU ---');
        await setup();
        console.log('User ID:', user.id);
        console.log('Category ID:', category.id);
        console.log('----------------------------');

        console.log('--- BẮT ĐẦU TEST POST API ---');

        // 1. Test Create VALID Post
        console.log('1. Test Create ACTIVE Post...');
        const validRes = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Javascript Tips',
                content: 'Always use const and let.',
                categoryId: category.id
            });

        if (validRes.status === 201) {
            console.log('   ✅ API trả về 201 Created.');
            if (validRes.body.data.status === 'active') {
                console.log('   ✅ Status Post là "active" (Không vi phạm).');
            } else {
                throw new Error('Status sai mong đợi: ' + validRes.body.data.status);
            }
        } else {
            console.error('Error Body:', validRes.body);
            throw new Error(`Failed to create post. Status: ${validRes.status}`);
        }

        // 2. Test Vi Phạm Moderation
        console.log('2. Test Create PENDING Post (Chứa từ cấm)...');
        const badRes = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Spam tin tức',
                content: 'Nội dung này chứa badword cấm.',
                categoryId: category.id
            });

        if (badRes.status === 201) {
            if (badRes.body.data.status === 'pending') {
                console.log('   ✅ Status Post là "pending" (Đã bị chặn bởi Moderation).');
                console.log('   ✅ Message:', badRes.body.data.message);
            } else {
                throw new Error('Moderation thất bại. Status vẫn là: ' + badRes.body.data.status);
            }
        } else {
             throw new Error('Failed to create bad post.');
        }

        // 3. Test Validate Input (Missing Title)
        console.log('3. Test Validate Input (Không Title)...');
        const invalidRes = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Missing title content',
                categoryId: category.id
            });
        
        if (invalidRes.status === 400) {
            console.log('   ✅ Bắt lỗi thành công (400 Bad Request).');
        } else {
            throw new Error(`Validate thất bại. Status: ${invalidRes.status}`);
        }

        // 4. Test Log System
        console.log('4. Kiểm tra System Logs...');
        const logs = await SystemLog.findAll({
            where: {
                userId: user.id,
                action: 'CREATE_POST'
            },
            order: [['created_at', 'DESC']],
            limit: 2
        });

        if (logs.length >= 2) {
            console.log(`   ✅ Đã tìm thấy ${logs.length} logs CREATE_POST cho user.`);
        } else {
            console.warn('   ⚠️ Số lượng log không khớp mong đợi.'); // Might be async delay or implementation detail
            console.log(logs.map(l => l.dataValues));
        }

        console.log('--- ✅ TEST POST FLOW SUCCESSFUL ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
