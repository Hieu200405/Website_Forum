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
const bannedWordRoute = require(path.join(serverSrc, 'routes/admin/bannedWord.route'));
const User = require(path.join(serverSrc, 'models/user.model'));
const BannedWord = require(path.join(serverSrc, 'models/bannedWord.model'));
const ROLES = require(path.join(serverSrc, 'constants/roles'));
const ModerationService = require(path.join(serverSrc, 'services/moderation.service'));

// Setup App
const app = express();
app.use(cors());
app.use(express.json());
// Mock route middleware logic manually or use router
// Ideally mount router, but router uses authMiddleware which verifies token.
app.use((req, res, next) => {
    // Inject user if token present (Mock Auth Middleware logic simplified for test)
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
            req.user = decoded;
        } catch(e) {}
    }
    next();
});
app.use('/api/admin/banned-words', bannedWordRoute);

const createToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
};

let admin, user;
const timestamp = Date.now();

async function setupData() {
    await sequelize.sync({ alter: true });

    admin = await User.create({
        username: `bw_admin_${timestamp}`,
        email: `bw_admin_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.ADMIN
    });

    user = await User.create({
        username: `bw_user_${timestamp}`,
        email: `bw_user_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });
}

async function runTests() {
    try {
        console.log('--- SETUP BANNED WORD TEST DATA ---');
        await setupData();
        const adminToken = createToken(admin.id, admin.role);
        const userToken = createToken(user.id, user.role);

        console.log('--- START ADMIN BANNED WORD FLOW ---');

        // 1. Test Add Banned Word (Admin)
        console.log('1. Admin adds "crypto"...');
        const resAdd = await request(app)
            .post('/api/admin/banned-words')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ word: 'Crypto' }); // Mixed case to test lowercase normalization

        let wordId;
        if (resAdd.status === 201) {
            console.log('   ✅ Thêm thành công.');
            wordId = resAdd.body.data.id;
            if (resAdd.body.data.word === 'crypto') {
                console.log('   ✅ Auto lowercase hoạt động.');
            } else {
                throw new Error('Lowercase failed: ' + resAdd.body.data.word);
            }
        } else {
            throw new Error(`Add failed: ${resAdd.status}`);
        }

        // 2. Test Add Duplicate (Admin)
        console.log('2. Admin adds duplicate "crypto"...');
        const resDup = await request(app)
            .post('/api/admin/banned-words')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ word: 'crypto' });
        
        if (resDup.status === 409) {
            console.log('   ✅ Chặn trùng lặp thành công.');
        } else {
            throw new Error(`Duplicate check failed: ${resDup.status}`);
        }

        // 3. Test Security (User Access)
        console.log('3. User tries to access Admin API...');
        const resUser = await request(app)
            .get('/api/admin/banned-words')
            .set('Authorization', `Bearer ${userToken}`);
        
        if (resUser.status === 403) {
            console.log('   ✅ Role Middleware chặn user thường thành công.');
        } else {
            throw new Error(`Security failed, User got: ${resUser.status}`);
        }

        // 4. Test Moderation Integration
        console.log('4. Verify ModerationService uses DB...');
        // Force refresh cache manually or wait?
        // ModerationService.lastUpdate = 0; // Hack internal state if possible, or we just rely on first load
        // Since we just added, next call might use cache if it was already loaded. 
        // But ModerationService instance in server might be different from test if require cache? 
        // No, 'require' caches module instance. So they share state in same process.
        
        // Invalidate cache for test
        ModerationService.lastUpdate = 0; 
        ModerationService.cache = [];

        const checkResult = await ModerationService.check('Buy some crypto now');
        if (!checkResult.isValid) { 
            console.log('   ✅ Moderation Service phát hiện từ cấm mới thêm.');
            console.log('      Found:', checkResult.bannedWordsFound);
        } else {
            throw new Error('Moderation Service failed to detect new banned word.');
        }

        // 5. Test Delete
        console.log('5. Admin deletes "crypto"...');
        const resDel = await request(app)
            .delete(`/api/admin/banned-words/${wordId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        if (resDel.status === 200) {
            console.log('   ✅ Xóa thành công.');
        } else {
            throw new Error(`Delete failed: ${resDel.status}`);
        }

        // Verify Delete
        ModerationService.lastUpdate = 0; // Force refresh
        ModerationService.cache = [];
        const checkResultAfter = await ModerationService.check('Buy some crypto now');
        if (checkResultAfter.isValid) {
             console.log('   ✅ Moderation Service cập nhật trạng thái xóa.');
        } else {
             throw new Error('Word still banned after delete. Found: ' + JSON.stringify(checkResultAfter.bannedWordsFound));
        }

        console.log('--- ✅ BANNED WORD FLOW TEST PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
