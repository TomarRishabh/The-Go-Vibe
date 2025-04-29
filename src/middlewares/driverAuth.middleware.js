const jwt = require('jsonwebtoken');
const Driver = require('../models/driver.model');

const driverAuthMiddleware = async (req, res, next) => {
    try {
        // Check if authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. No token provided.'
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find driver by ID
        const driver = await Driver.findById(decoded.id);
        
        if (!driver) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token.'
            });
        }
        
        // Attach driver to request object
        req.driver = driver;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

module.exports = driverAuthMiddleware;