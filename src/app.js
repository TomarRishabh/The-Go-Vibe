const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error.middleware');
const routes = require('./routes');
const logger = require('./utils/logger');
const driverRoutes = require('./routes/driver.routes');  // Correct routes import

require('dotenv').config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(require('morgan')('dev', { stream: logger.stream }));
}

// Routes
app.use('/api/v1', routes);
app.use('/api/v1/drivers', driverRoutes);  // Only this for all driver related APIs

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
});

const PORT = process.env.PORT || 3000;

const server = app.listen(
  PORT,
  () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

module.exports = server;
