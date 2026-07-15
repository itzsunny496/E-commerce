require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();

// Security Middleware
app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((url) => url.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(async () => {
    console.log('MongoDB connected');
    
    // Auto-create Admin from .env
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');
      
      const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
        await User.create({
          name: 'Super Admin',
          email: process.env.ADMIN_EMAIL,
          password_hash,
          role: 'admin',
          auth_provider: 'local'
        });
        console.log(`Admin user created with email: ${process.env.ADMIN_EMAIL}`);
      }
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// More detailed connection events for debugging
mongoose.connection.on('connected', () => console.log('Mongoose event: connected'));
mongoose.connection.on('error', (err) => console.error('Mongoose event: error', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose event: disconnected'));

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('E-commerce API is running...');
});

// Health check route to expose DB connection state
app.get('/api/health', (req, res) => {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const state = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ success: true, dbState: state, status: states[state] || 'unknown' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
