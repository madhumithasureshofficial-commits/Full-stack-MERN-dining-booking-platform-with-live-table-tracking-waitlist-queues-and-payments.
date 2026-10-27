require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Import configurations
const connectDB = require('./config/db');
const socketService = require('./sockets/socketService');

// Import middlewares
const errorHandler = require('./middleware/error');
const { apiLimiter } = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const tableRoutes = require('./routes/tables');
const reservationRoutes = require('./routes/reservations');
const waitlistRoutes = require('./routes/waitlist');
const paymentRoutes = require('./routes/payments');
const analyticsRoutes = require('./routes/analytics');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
socketService.init(server);

// --- SECURITY MIDDLEWARES ---
// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: '*', // In production, replace with specific frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// Apply rate limiting to all requests
app.use('/api/', apiLimiter);

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root path handler
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Dine Booking System API',
    version: '1.0.0'
  });
});

// --- GLOBAL ERROR HANDLER ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
