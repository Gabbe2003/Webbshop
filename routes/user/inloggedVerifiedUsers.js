const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: 'Too many password change requests from this IP, please try again after 15 minutes',
  });

const userLogOut = require('../../userOperations/logoutUser');
const updateUserInfo = require('../../userSettings/updateUserInfo');
const deleteUser = require('../../userSettings/deleteUser');
const getUserMessages = require('../../chattControllers/getUserChat');

router.post('/logout', limiter, userLogOut.handleLogout); //logout user
router.put('/updateUserInfo/:userId', limiter, updateUserInfo.updateUserData); // update user information
router.delete('/deleteUser/:userId', limiter, deleteUser.deleteUser); // delete user
router.get('/getUserMessages', limiter, getUserMessages.getUserMessages ); // get user messages with id

module.exports = router; 