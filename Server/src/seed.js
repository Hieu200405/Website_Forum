require('dotenv').config();
const sequelize = require('./config/database');
const bcrypt = require('bcrypt');

const User = require('./models/user.model');
const Post = require('./models/post.model');
const Category = require('./models/category.model');
const ROLES = require('./constants/roles');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB Connected');
    await sequelize.sync(); // Ensure tables

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    const [admin, adminCreated] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        email: 'admin@forum.com',
        password: passwordHash,
        role: ROLES.ADMIN,
        isVerified: true
      }
    });
    if (!adminCreated) {
        await admin.update({ password: passwordHash });
        console.log('Admin password updated');
    }
    console.log('Admin ready:', admin.id);

    // 2. Create Mod
    const [mod, modCreated] = await User.findOrCreate({
        where: { username: 'moderator' },
        defaults: {
          email: 'mod@forum.com',
          password: passwordHash,
          role: ROLES.MODERATOR,
          isVerified: true
        }
      });
    if (!modCreated) {
        await mod.update({ password: passwordHash });
        console.log('Mod password updated');
    }
      console.log('Mod ready:', mod.id);

    // 3. Create Categories
    const categories = ['Thảo luận', 'Công nghệ', 'Hỏi đáp'];
    for(const name of categories) {
        await Category.findOrCreate({
            where: { name },
            defaults: { slug: name.toLowerCase().replace(/ /g, '-') }
        });
    }
    console.log('Categories created');

    console.log('SEED OK');
    process.exit(0);
  } catch (error) {
    console.error('SEED ERROR:', error);
    process.exit(1);
  }
};

run();
