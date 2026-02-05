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
const authRoute = require(path.join(serverSrc, 'routes/auth.route'));
const postRoute = require(path.join(serverSrc, 'routes/post.route'));
const User = require(path.join(serverSrc, 'models/user.model'));
const Category = require(path.join(serverSrc, 'models/category.model'));
const ROLES = require(path.join(serverSrc, 'constants/roles'));
const RedisService = require(path.join(serverSrc, 'services/redis.service'));

// Setup App
const app = express();
app.use(cors());
app.use(express.json());
// Mount Routes
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);

const createToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
};

const timestamp = Date.now();
let user;

async function setupData() {
    await sequelize.sync({ alter: true });
    
    user = await User.create({
        username: `ratelimit_${timestamp}`,
        email: `ratelimit_${timestamp}@test.com`,
        password: 'pass',
        role: ROLES.USER
    });
}

/**
 * Clear Redis keys to ensure clean test state
 */
async function clearRedisKeys() {
    console.log('   Cleaning Redis keys...');
    // Clear login keys for localhost IP
    // Localhost IP often ::1 or 127.0.0.1
    // We will simulate IP in headers so we know the key
    const testIp = '10.0.0.1'; 
    const loginKey = `rate:login:${testIp}`;
    const postKey = `rate:post:user_${user ? user.id : 'unknown'}`;
    
    // RedisService methods are async? check file. Yes.
    // But RedisService.client might be needed for specific DEL if service doesn't have it.
    // RedisService has delPattern.
    await RedisService.delPattern(`rate:login:${testIp}`);
    if (user) {
        await RedisService.delPattern(`rate:post:user_${user.id}`);
    }
}

async function runTests() {
    try {
        console.log('--- SETUP RATE LIMIT TEST ---');
        await setupData();
        await clearRedisKeys();

        // 1. Test Login Rate Limit (Limit 5 / 60s)
        console.log('\n--- 1. TEST LOGIN RATE LIMIT (Limit: 5) ---');
        const testIp = '10.0.0.1';
        
        for (let i = 1; i <= 5; i++) {
            process.stdout.write(`   Request ${i}... `);
            const res = await request(app)
                .post('/api/auth/login')
                .set('X-Forwarded-For', testIp) // Spoof IP
                .send({ email: 'wrong@test.com', password: 'wrong' });
            
            // Expected 400/401 (Logic fail) or 404, BUT NOT 429
            if (res.status === 429) {
                console.log('❌ FAILED (Too early 429)');
                throw new Error(`Hit rate limit too early at req ${i}`);
            }
            console.log('✅ OK');
        }

        // 6th Request -> Expect 429
        console.log('   Request 6 (Should Fail)...');
        const resBlock = await request(app)
            .post('/api/auth/login')
            .set('X-Forwarded-For', testIp)
            .send({ email: 'wrong@test.com', password: 'wrong' });

        if (resBlock.status === 429) {
            console.log('   ✅ BLOCKED (429 Too Many Requests)');
            console.log(`   Msg: ${resBlock.body.message}`);
        } else {
            console.log(`   ❌ FAILED. Status: ${resBlock.status}`);
            throw new Error('Rate limit did not trigger for Login');
        }


        // 2. Test Post Rate Limit (Limit 10 / 60s)
        console.log('\n--- 2. TEST POST RATE LIMIT (Limit: 10 - User Based) ---');
        const userToken = createToken(user.id, user.role);
        
        // Ensure Category exists for creating post
        const cat = await Category.findOne() || await Category.create({name: 'RateCat', description:'desc'});

        for (let i = 1; i <= 10; i++) {
            process.stdout.write(`   Request ${i}... `);
            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: `Spam Post ${i}`, content: 'Spam content', categoryId: cat.id });
                
            // Expect 201 (Created) or 202 (Pending)
            if (res.status === 429) {
                console.log('❌ FAILED (Too early 429)');
                throw new Error(`Hit rate limit too early at req ${i}`);
            }
            console.log('✅ OK');
        }

        // 11th Request -> Expect 429
        console.log('   Request 11 (Should Fail)...');
        const resPostBlock = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'Spam Post 11', content: 'Spam content', categoryId: cat.id });

        if (resPostBlock.status === 429) {
            console.log('   ✅ BLOCKED (429 Too Many Requests)');
        } else {
            console.log(`   ❌ FAILED. Status: ${resPostBlock.status}`);
            throw new Error('Rate limit did not trigger for Create Post');
        }

        console.log('\n--- ✅ RATE LIMIT TEST SUITE PASSED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await sequelize.close();
        // Close redis client?
        // RedisService doesn't expose close explicitly but app exit handles it.
        // We can force exit.
        process.exit(0);
    }
}

runTests();
