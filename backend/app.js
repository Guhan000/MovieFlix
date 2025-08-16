const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const favoritesRoutes = require('./routes/favorites');

// Service imports
const cacheManager = require('./services/cacheManager');
const { createDefaultAdmin } = require('./middleware/adminAuth');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/favorites', favoritesRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MovieFlix API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, async (error) => {
  if (!error) {
    console.log(`MovieFlix API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Movie search: http://localhost:${PORT}/api/movies/search?search=batman`);
    console.log(`Analytics: http://localhost:${PORT}/api/movies/analytics/dashboard`);
    
    // Initialize services after server starts
    try {
      // Create default admin user if needed
      await createDefaultAdmin();
      
      // Initialize cache management
      cacheManager.initialize();
      
      console.log('All services initialized successfully');
    } catch (initError) {
      console.error('Service initialization error:', initError.message);
    }
  } else {
    console.log('Server error:', error);
  }
});