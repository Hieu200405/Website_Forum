const request = require('supertest');
const express = require('express');
const cors = require('cors');
const sequelize = require('../Server/src/config/database');
const authRoute = require('../Server/src/routes/auth.route');
const SystemLog = require('../Server/src/models/systemLog.model');
const User = require('../Server/src/models/user.model');

// Setup mock app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoute);

// Use a unique suffix for testing to avoid conflicts
const testTimestamp = Date.now();
const testUser = {
    username: `test_user_${testTimestamp}`,
    email: `test_${testTimestamp}@example.com`,
    password: 'password123'
};

async function runTests() {
    try {
        console.log('--- BẮT ĐẦU KIỂM TRA HỆ THỐNG AUTHENTICATION ---');

        // 1. Sync DB (để đảm bảo bảng tồn tại)
        console.log('1. Đang đồng bộ database...');
        // Load SystemLog model manually here to enforce creation if not already loaded by route
        // (Though in real app index.js does this, here we are using a truncated app)
        await sequelize.sync(); 
        console.log('   ✅ Đã kết nối và đồng bộ DB.');

        // 2. Test Register
        console.log(`2. Test Đăng ký User mới: ${testUser.username}`);
        const regRes = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        if (regRes.status === 201) {
            console.log('   ✅ Đăng ký thành công (Status 201).');
            if (!regRes.body.data.id) throw new Error('Không nhận được User ID trả về');
        } else {
            console.error('   ❌ Đăng ký thất bại:', regRes.body);
            throw new Error(`Đăng ký thất bại với status ${regRes.status}`);
        }

        // 3. Test Login
        console.log('3. Test Đăng nhập với tài khoản vừa tạo...');
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        if (loginRes.status === 200) {
            console.log('   ✅ Đăng nhập thành công (Status 200).');
            if (loginRes.body.accessToken) {
                console.log('   ✅ Đã nhận được JWT Token.');
            } else {
                throw new Error('Không nhận được Access Token');
            }
        } else {
            console.error('   ❌ Đăng nhập thất bại:', loginRes.body);
            throw new Error(`Đăng nhập thất bại với status ${loginRes.status}`);
        }

        // 4. Verify System Logs
        console.log('4. Kiểm tra bảng system_logs...');
        // Check log REGISTER
        const registerLog = await SystemLog.findOne({
            where: {
                action: 'REGISTER',
                data: JSON.stringify(null) // or verifying based on user id if possible, but data is null in code
                // Note: In register.usecase.js: LoggingService.log(newUser.id, 'REGISTER', ip);
                // SystemLog stores userId.
            },
            order: [['created_at', 'DESC']]
        });

        // We check the most recent logs for this user just to be sure
        // Since we don't have the user ID easily accessible in this scope without parsing regRes again (which we can do)
        const userId = regRes.body.data.id;
        
        const logs = await SystemLog.findAll({
            where: { userId: userId },
            order: [['created_at', 'ASC']]
        });
        
        if (logs.length >= 2) {
             const actions = logs.map(l => l.action);
             console.log(`   ✅ Tìm thấy ${logs.length} logs cho User ID ${userId}: ${actions.join(', ')}`);
             if(actions.includes('REGISTER') && actions.includes('LOGIN')) {
                 console.log('   ✅ Full luồng Log (REGISTER -> LOGIN) đã được ghi nhận.');
             } else {
                 console.warn('   ⚠️ Log chưa đầy đủ các action mong đợi.');
             }
        } else {
             console.error('   ❌ Không tìm thấy đủ log trong DB. (Có thể LoggingService gặp lỗi hoặc chưa ghi kịp)');
             console.log('   Logs found:', logs.map(l => l.dataValues));
        }

        console.log('--- ✅ KIỂM TRA HOÀN TẤT THÀNH CÔNG ---');
        
    } catch (error) {
        console.error('\n❌ KIỂM TRA THẤT BẠI:', error.message);
    } finally {
        await sequelize.close();
    }
}

// Chạy test
runTests();
