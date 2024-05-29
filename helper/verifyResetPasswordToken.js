const User = require('../models/user');
const crypto = require('crypto');

const validatePasswordToken = async (req, res) => {
    const { token } = req.query;  

    if (!token) {
        console.log("Token received:", token);
        return res.status(401).json({ message: 'No token is found in the request.' });
    }

    // Hash the received token before comparison
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        // Find a user whose verifyTokens array contains the hashed token and the token hasn't expired
        const foundUser = await User.findOne({
            'verifyTokens': {
                $elemMatch: {
                    token: hashedToken,
                    expires: { $gt: Date.now() } 
                }
            }
        });

        if (foundUser) {
            console.log("User found with token:", foundUser);
            foundUser.verified = true;
            foundUser.verifyTokens = [];
            await foundUser.save();
            res.status(200).json({ message: 'Token is valid' });
        } else {
            console.log("No user found with the provided token or token is expired");
            res.status(404).json({ message: 'Token not found or expired' });
        }
    } catch (error) {
        console.error("Error during token validation:", error);
        res.status(500).json({ message: 'Error while trying to handle your token' });
    }
};

module.exports = { validatePasswordToken };
