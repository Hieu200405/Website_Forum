const path = require('path');
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import Modules
const sequelize = require('../Server/src/config/database');
const notificationRoute = require('../Server/src/routes/notification.route');
const Notification = require('../Server/src/models/notification.model');
const User = require('../Server/src/models/user.model');
const ROLES = require('../Server/src/constants/roles');

// Setup App
const app = express();
app.use(cors());
app.use(express.json());
// Global handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
});
app.use('/api/notifications', notificationRoute); // Mount

const createToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
};

let user, sender, notification;
const timestamp = Date.now();

async function setupData() {
    await sequelize.sync({ alter: true });

    // Users
    user = await User.create({
        username: `noti_rec_${timestamp}`,
        email: `noti_rec_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    sender = await User.create({
        username: `noti_sen_${timestamp}`,
        email: `noti_sen_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });

    // Create Notification manually
    notification = await Notification.create({
        user_id: user.id,
        sender_id: sender.id,
        type: 'LIKE',
        post_id: 1, // Mock
        isRead: false
    });
}

async function runTests() {
    try {
        console.log('--- SETUP NOTIFICATIONS TEST DATA ---');
        await setupData();
        const token = createToken(user.id, user.role);

        console.log('--- START NOTIFICATIONS FLOW TEST ---');

        // 1. Get Notifications
        console.log('1. User gets notifications...');
        const resGet = await request(app)
            .get(`/api/notifications`)
            .set('Authorization', `Bearer ${token}`);

        if (resGet.status === 200 && Array.isArray(resGet.body) && resGet.body.length > 0) {
            console.log('   ✅ Fetch notifications thành công.');
            if (resGet.body[0].isRead === false) {
                 console.log('   ✅ Notification status is unread.');
            }
        } else {
            throw new Error(`Get Notifications Failed: ${resGet.status} - ${JSON.stringify(resGet.body)}`);
        }

        // 2. Mark Notification as Read
        console.log('2. User marks notification as read...');
        const resMark = await request(app)
            .put(`/api/notifications/${notification.id}/read`)
            .set('Authorization', `Bearer ${token}`);

        if (resMark.status === 200) {
            console.log('   ✅ Mark as read thành công.');
        } else {
            throw new Error(`Mark Read Failed: ${resMark.status}`);
        }

        // 3. Verify Database
        console.log('3. Verify database status...');
        const dbNoti = await Notification.findByPk(notification.id);
        if (dbNoti.isRead === true) {
             console.log('   ✅ DB update: Notification isRead = true.');
        } else {
             throw new Error(`Not updated in DB`);
        }

        console.log('--- ✅ NOTIFICATIONS FLOW TEST PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}


// Robust execution wrapper added to avoid hanging CI and report correct exit code
runTests().then(() => {
    // Give a short delay to allow logs to flush
    setTimeout(() => {
        console.log('Exiting process with code:', process.exitCode || 0);
        process.exit(process.exitCode || 0);
    }, 500);
}).catch((err) => {
    console.error('Unhandled Rejection in runTests:', err);
    process.exit(1);
});
