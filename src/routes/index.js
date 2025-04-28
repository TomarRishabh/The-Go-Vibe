const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const rideController = require('../controllers/ride.controller');
const driverAuthRoutes = require('./driverAuth.routes');


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.post('/rides/estimate', rideController.estimateFare);
router.use('/api/v1/driver/auth', driverAuthRoutes);


// router.post('/rides/estimate', rideController.estimateRide);
// router.post('/rides', rideController.createRide);
// router.get('/rides/:id', rideController.getRideDetails);


module.exports = router;