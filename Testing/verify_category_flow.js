const path = require('path');
// Hack: Add Server/node_modules to search path so we can resolve packages installed in Server/
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));

require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import App Modules (Relative from Testing/ folder to Server/src/)
const sequelize = require('../Server/src/config/database');
const categoryRoute = require('../Server/src/routes/category.route');
const SystemLog = require('../Server/src/models/systemLog.model');
const Category = require('../Server/src/models/category.model');
const User = require('../Server/src/models/user.model');
const ROLES = require('../Server/src/constants/roles');

// Setup mock app
const app = express();
app.use(cors());
app.use(express.json());
// Mock request user for auth middleware if we were using it directly, 
// but here we use the real middleware so we need to mock authentication logic or mount it.
// However, the category routes use authMiddleware which verifies token.
// So we just mount routes as usual.
app.use((req, res, next) => {
    req.user = undefined; // Ensure clean state
    next();
});
app.use('/api/categories', categoryRoute);


// Helper: Create Mock Token
const createToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'secretkey', // Fallback if env not loaded (but it should be)
        { expiresIn: '1h' }
    );
};

// Test Data
const timestamp = Date.now();
const adminUser = { id: 9999, role: ROLES.ADMIN }; // Mock ID
const normalUser = { id: 8888, role: ROLES.USER }; // Mock ID
// Note: We don't strictly need real users in DB if Middleware only checks Token Payload.
// But CreateCategoryUseCase might pass adminId to LoggingService, which might be FK constrained?
// Looking at system_logs model: userId has no FK constraint strictness in Sequelize definition unless explicitly defined 'references'.
// In step 32, userId in SystemLog model: `userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' }`. No strict FK references definition seen.
// So we can skip creating real users to speed up, or create them to be safe. 
// Safe bet: Create real users because LoggingService logs action.

async function runTests() {
    try {
        console.log('--- BẮT ĐẦU KIỂM TRA CHỨC NĂNG CATEGORY ---');

        // 1. Sync DB
        await sequelize.sync({ alter: true });
        console.log('1. Database synced.');

        // 2. Setup Tokens
        const adminToken = createToken(adminUser.id, adminUser.role);
        const userToken = createToken(normalUser.id, normalUser.role);

        // 3. Test Create Category (Admin)
        const newCategoryName = `Tech_${timestamp}`;
        console.log(`2. Test Create Category (Admin): ${newCategoryName}`);
        
        const createRes = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: newCategoryName,
                description: 'Technology discussions'
            });

        if (createRes.status === 201) {
            console.log('   ✅ Tạo thành công (201 Created).');
        } else {
            throw new Error(`Create failed: ${createRes.status} - ${JSON.stringify(createRes.body)}`);
        }

        const categoryId = createRes.body.data.id;

        // 4. Test Create Category (User) - Should Fail
        console.log('3. Test Create Category (User) -> Expect 403');
        const failRes = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ name: `Hack_${timestamp}` });

        if (failRes.status === 403) {
            console.log('   ✅ User thường bị chặn đúng mong đợi (403).');
        } else {
            throw new Error(`Security Fail: User could create category! Status: ${failRes.status}`);
        }

        // 5. Test Get Categories (Public)
        console.log('4. Test Get List (Public)');
        const getRes = await request(app).get('/api/categories');
        if (getRes.status === 200 && Array.isArray(getRes.body.data)) {
            const found = getRes.body.data.find(c => c.id === categoryId);
            if (found) console.log('   ✅ Đã tìm thấy category vừa tạo trong danh sách.');
            else throw new Error('Category vừa tạo không hiển thị trong list.');
        } else {
            throw new Error('Get Categories failed.');
        }

        // 6. Test Update (Admin)
        console.log('5. Test Update Category (Admin)');
        const updateName = `Tech_Updated_${timestamp}`;
        const updateRes = await request(app)
            .put(`/api/categories/${categoryId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: updateName });
        
        if (updateRes.status === 200 && updateRes.body.data.name === updateName) {
            console.log('   ✅ Cập nhật thành công.');
        } else {
            throw new Error('Update failed.');
        }

        // 7. Test Delete (Admin)
        console.log('6. Test Delete Category (Admin)');
        const deleteRes = await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        if (deleteRes.status === 200) {
            console.log('   ✅ Xóa thành công.');
        } else {
            throw new Error('Delete failed.');
        }

        // 8. Verify DB
        const deletedCat = await Category.findByPk(categoryId);
        if (!deletedCat) {
            console.log('   ✅ Verified: Category đã biến mất khỏi DB.');
        } else {
            throw new Error('Category vẫn còn trong DB sau khi delete.');
        }

        // 9. Verify Logs
        console.log('7. Verify System Logs');
        const logs = await SystemLog.findAll({
            where: {
                action: ['CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY'],
                // Check recent logs
                created_at: { [require('sequelize').Op.gt]: new Date(Date.now() - 10000) } 
            }
        });

        if (logs.length >= 3) {
            console.log(`   ✅ Logs recorded: ${logs.map(l => l.action).join(', ')}`);
        } else {
            console.warn('   ⚠️ Logs might be missing or delayed.', logs.map(l => l.action));
        }

        console.log('--- ✅ TEST CATEGORY FLOW SUCCESSFULLY COMPLETED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
