const GoogleLoginUseCase = require('./src/usecases/googleLogin.usecase');
const sequelize = require('./src/config/database');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');
        await GoogleLoginUseCase.execute('fake_token', '127.0.0.1');
    } catch (error) {
        console.error('Test Result:', error);
    }
}

test();
