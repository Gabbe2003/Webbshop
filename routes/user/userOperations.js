const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: 'Too many password change requests from this IP, please try again after 15 minutes',
  });
  
const registerUser = require('../../userOperations/registerUser');
const resetPasswordHandler = require('../../helper/pwdResetEmail');
const validateUserVerification = require('../../middleware/verifyUser');
const changeUserPassword = require('../../userSettings/changeUserPassword');
const verifyTokenHandler = require('../../helper/verifyResetPasswordToken');

router.get('/verifyTokenHandler', limiter, verifyTokenHandler.validatePasswordToken);
router.post('/registerUser', limiter, registerUser.handleNewUser); //register new User
router.post('/resetPassword', limiter, resetPasswordHandler.handlePWDReset); //generate the token for a new password
router.get('/validateUserVerification', limiter, validateUserVerification); // verify the token that we generated for the password
router.post('/changeUserPassword', limiter, changeUserPassword.handleChangePassword );// change the user password after validation 


module.exports = router; 