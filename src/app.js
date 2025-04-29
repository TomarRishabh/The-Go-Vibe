const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error.middleware');
const routes = require('./routes');
const logger = require('./utils/logger');
const driverRoutes = require('./routes/driver.routes');

require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(require('morgan')('dev', { stream: logger.stream }));
}

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      // Check if database is responding
      await mongoose.connection.db.admin().ping();
      return res.status(200).json({ status: 'UP', database: 'Connected' });
    } else {
      return res.status(500).json({ 
        status: 'DOWN', 
        database: 'Disconnected',
        readyState: mongoose.connection.readyState
      });
    }
  } catch (error) {
    logger.error('Health check failed:', error);
    return res.status(500).json({ 
      status: 'DOWN', 
      error: error.message,
      database: 'Error'
    });
  }
});

// Routes
app.use('/api/v1', routes);
app.use('/api/v1/drivers', driverRoutes); 

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  logger.error(err.stack);
});

const PORT = process.env.PORT || 3000;

// Connect to DB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the server only after DB connection is established
    const server = app.listen(
      PORT,
      () => logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    );
    
    // Graceful shutdown for Docker
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed.');
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed.');
          process.exit(0);
        });
      });
    });
    
    return server;
  } catch (err) {
    logger.error(`Error starting server: ${err.message}`);
    process.exit(1);
  }
};

// Start server
if (require.main === module) {
  startServer();
}

module.exports = app;
