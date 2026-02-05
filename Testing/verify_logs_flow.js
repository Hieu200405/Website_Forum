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
const User = require(path.join(serverSrc, 'models/user.model'));
const ROLES = require(path.join(serverSrc, 'constants/roles'));
const LoggingService = require(path.join(serverSrc, 'services/logging.service'));

// Setup App
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoute);

const createToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
};

let admin, user;
const timestamp = Date.now();

async function setupData() {
    await sequelize.sync({ alter: true });

    admin = await User.create({
        username: `log_admin_${timestamp}`,
        email: `log_admin_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.ADMIN
    });

    user = await User.create({
        username: `log_user_${timestamp}`,
        email: `log_user_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    // Create Dummy Logs
    await LoggingService.log(admin.id, 'TEST_ACTION_1', '127.0.0.1', { detail: 'Log 1' });
    await LoggingService.log(user.id, 'TEST_ACTION_2', '127.0.0.1', { detail: 'Log 2' });
    await LoggingService.log(admin.id, 'TEST_ACTION_3', '127.0.0.1', { detail: 'Log 3' });
}

async function runTests() {
    try {
        console.log('--- SETUP SYSTEM LOGS TEST DATA ---');
        await setupData();
        const adminToken = createToken(admin.id, admin.role);
        const userToken = createToken(user.id, user.role);

        console.log('\n--- 1. TEST VIEW LOGS (ADMIN) ---');
        
        // 1.1 Simple Get All (Default Pagination)
        console.log('1.1 Fetching all logs...');
        const resAll = await request(app)
            .get('/api/admin/logs')
            .set('Authorization', `Bearer ${adminToken}`);
        
        if (resAll.status === 200) {
            console.log(`   ✅ Success. Total logs: ${resAll.body.data.total}`);
            // Should be at least 3
            if (resAll.body.data.total >= 3) {
                 console.log('   ✅ Log Count OK.');
            } else {
                 throw new Error('Log Count Mismatch');
            }
        } else {
             throw new Error(`Fetch Logs Failed: ${resAll.status}`);
        }

        // 1.2 Filter by Action
        console.log('1.2 Filter by Action "TEST_ACTION_2"...');
        const resFilter = await request(app)
            .get('/api/admin/logs?action=TEST_ACTION_2')
            .set('Authorization', `Bearer ${adminToken}`);
        
        if (resFilter.status === 200 && resFilter.body.data.logs.length >= 1) {
            // Check if returned logs match action
            const log = resFilter.body.data.logs[0];
            if (log.action === 'TEST_ACTION_2') {
                 console.log('   ✅ Filter Action OK.');
            } else {
                 throw new Error('Filter Action Mismatch');
            }
        } else {
             throw new Error('Filter By Action Failed or Empty');
        }

        // 1.3 Filter by UserId
        console.log(`1.3 Filter by UserId ${admin.id}...`);
        const resUserFilter = await request(app)
            .get(`/api/admin/logs?userId=${admin.id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        if (resUserFilter.status === 200) {
             const logs = resUserFilter.body.data.logs;
             const verify = logs.every(l => l.userId === admin.id);
             if (verify && logs.length >= 2) { // We created 2 logs for admin
                 console.log('   ✅ Filter UserId OK.');
             } else {
                 throw new Error('Filter UserId Failed');
             }
        }

        console.log('\n--- 2. TEST SECURITY (User Access) ---');
        const resAccess = await request(app)
            .get('/api/admin/logs')
            .set('Authorization', `Bearer ${userToken}`);
        
        if (resAccess.status === 403) {
             console.log('   ✅ User bị chặn xem log (403 Forbidden).');
        } else {
             throw new Error(`Security Failed: Got ${resAccess.status}`);
        }

        console.log('\n--- ✅ SYSTEM LOGS TEST SUITE PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
