require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoute = require('./routes/auth.route');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoute);
app.get('/', (req, res) => res.send('Forum API running'));
app.get('/', (req, res) => {
  res.send('API OK');
});

// Load models để sync DB
require('./models/user.model');
require('./models/systemLog.model');

// Apply Rate Limit Global
const { limiter } = require('./middlewares/rateLimit.middleware');
app.use(limiter);

sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Database sync error:', err));
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
