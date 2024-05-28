const User = require('../mongodb/user');

const validateUserVerification = async (req, res, next) => {
    const { identifier } = req.body;  // Identifier can be username or email

    // Early exit if no identifier is provided
    if (!identifier) {
        console.log('MIDDLEWARE 1111111111')
        console.log("No identifier provided in request");
        return res.status(400).json({ isValid: false, message: 'Identifier is required' });
    }


    console.log('MIDDLEWARE 1111111111')
    try {
        // Attempt to find the user by email or username
        const user = await User.findOne({
            $or: [ 
                { email: identifier},
                { username: identifier }
            ]
        });

        // If user is not found, return an error
        if (!user) {
            console.log("No user found with the provided identifier.");
            return res.status(404).json({ isValid: false, message: 'User not found' });
        }

        // If user is already verified, skip further checks and continue
        if (user.verified) {
            console.log("User is already verified:", user.email || user.username);
            return next();  // Pass control to the next middleware
        }

        user.verifyTokens = [];
        await user.save();

        console.log('DONE');
        return next();  // Verification successful, move to next middleware
    } catch (error) {
        console.error('Error during token validation:', error);
        return res.status(500).json({ isValid: false, message: 'Error validating token' });
    }
};

module.exports = validateUserVerification;
