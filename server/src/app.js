require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.JWT_SECRET || 'session_secret',
    resave: false,
    saveUninitialized: true,
  })
);

app.get('/', (req, res) => {
  res.json({ message: 'Private course server is running' });
});

app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', detail: err.message });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
