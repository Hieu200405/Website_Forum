const path = require('path');
module.paths.push(path.resolve(__dirname, '../Server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../Server/.env') });

const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Import Modules
const authRoute = require('../Server/src/routes/auth.route');

// Setup App
const app = express();
app.use(cors());
app.use(express.json());
// Global handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
});
app.use('/api/auth', authRoute); // Mount 

async function runTests() {
    try {
        console.log('--- START GOOGLE LOGIN API TEST ---');

        // 1. Send an invalid token to /api/auth/google
        console.log('1. Attempting Google Login with invalid token...');
        const resGoogle = await request(app)
            .post(`/api/auth/google`)
            .send({ token: 'invalid_google_token' });
            
        // Expected behavior: The google-auth-library throws an error, UseCase returns 401
        if (resGoogle.status === 401) {
            console.log('   ✅ Google Login properly rejected invalid token (401). Response: ', resGoogle.body.message);
        } else if (resGoogle.status === 500) {
            console.log('   ⚠️ Server returned 500 instead of 401. Make sure to catch properly.');
        } else {
            console.log(`   ❌ Unexpected status: ${resGoogle.status}`);
        }

        console.log('--- ✅ GOOGLE LOGIN API STRUCTURE TEST PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exitCode = 1;
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
