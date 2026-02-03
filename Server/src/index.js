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
sequelize.sync();
app.get('/', (req, res) => {
  res.send('API OK');
});
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
