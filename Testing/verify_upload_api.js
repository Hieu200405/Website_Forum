const path = require('path');
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Import Modules
const uploadRoute = require('../Server/src/routes/upload.route');
const authMiddleware = require('../Server/src/middlewares/auth.middleware');

// Setup MOCK App
const app = express();
app.use(cors());
app.use(express.json());
// Global handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
});

// Since upload route is protected by auth middleware, for this simple API structure test 
// we override it or mock it if needed. But let's mount it unchanged to test the 401 response first.
app.use('/api/upload', uploadRoute);

async function runTests() {
    try {
        console.log('--- START UPLOAD API STRUCTURE TEST ---');

        // 1. Send request without token to /api/upload
        console.log('1. Attempting Upload without Auth token...');
        const resNoAuth = await request(app)
            .post(`/api/upload`);
            
        // Because of authMiddleware, we should get 401
        if (resNoAuth.status === 401 || resNoAuth.status === 403) {
            console.log('   ✅ Upload API properly blocked unauthenticated request (401). Response: ', resNoAuth.body.message);
        } else {
            console.log(`   ❌ Unexpected status: ${resNoAuth.status}`);
            throw new Error('Upload API is not protected');
        }

        console.log('--- ✅ UPLOAD API STRUCTURE TEST PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    }
}

runTests();
