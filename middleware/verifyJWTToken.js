const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyJWT = async (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        console.log('MIDDLEWARE 22222222')
        return res.status(401).json({ 'message': 'No token is provided' });
    }


    console.log('MIDDLEWARE 22222222222')
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            // Handle different types of JWT errors
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 'message': 'The provided token is expired!' });
            } else {
                return res.status(409).json({ 'message': 'The provided token is invalid!' });
            }
        }

        try {
            const user = await User.findById(decoded.UserInfo.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            console.log(user)
            if (!user.verified) {
                return res.status(403).json({ message: 'Account not verified. Please verify your email.' });
            }

            req.user = {
                id: user._id,
                username: user.username
            };

            console.log(`Access token verified for user: ${req.user.username}, ${req.user.id}`);
            next();
        } catch (error) {
            console.error('Error during user verification:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
};

module.exports = verifyJWT;
