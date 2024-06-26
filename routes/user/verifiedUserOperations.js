const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: 'Too many password change requests from this IP, please try again after 15 minutes',
  });

  
const authUser = require('../../userOperations/userLogin');
const refreshTokenHandler = require('../../userOperations/refreshTokenHandler');


router.post('/login', limiter, authUser.handleLogin); //authenticate user
router.post('/refresh', limiter, refreshTokenHandler.handleRefreshToken); //refresh the token for user

module.exports = router; 