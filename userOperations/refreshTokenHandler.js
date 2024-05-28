// const User = require('../models/user');
// const jwt = require('jsonwebtoken');

// const handleRefreshToken = async (req, res) => {
//     console.log('Handling refresh token request');
//     const cookies = req.cookies;
//     console.log(req.cookies)

//     if (!cookies?.refreshToken) {
//         console.log('No refresh token cookie present in the request.');
//         return res.status(401).json({'message': 'No cookie found in session' });
//     }

//     console.log('Refresh token found in cookies:', cookies.refreshToken);
//     const refreshToken = cookies.refreshToken;

//     try {
//         console.log('Verifying refresh token...');
//         jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
//             if (err) {
//                 console.log('Error during refresh token verification:', err);
//                 return res.status(403).json({'message': err.message});
//             }

//             console.log('Refresh token is valid, generating new access token...');
//             const accessToken = jwt.sign(
//                 { "UserInfo": { "username": decoded.username, "id": decoded.id } },
//                 process.env.ACCESS_TOKEN_SECRET,
//                 { expiresIn: '2h' }
//             );

//             console.log(`New access token generated for user: ${decoded.username}`);

//             // Optionally generate a new refresh token
//             const newRefreshToken = jwt.sign(
//                 { "username": decoded.username, "id": decoded.id },
//                 process.env.REFRESH_TOKEN_SECRET,
//                 { expiresIn: '7d' }
//             );

//             console.log(`Updating user's refresh token in database...`);
//             await User.findOneAndUpdate(
//                 { _id: decoded.id },
//                 { refreshToken: newRefreshToken }
//             );

//             console.log('User document updated with new refresh token.');

//             res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'Lax', secure: false, maxAge: 2 * 60 * 60 * 1000 });
//             res.cookie('refreshToken', newRefreshToken, {httpOnly: true, sameSite: 'Lax', secure: false, maxAge: 7 * 24 * 60 * 60 * 1000});

//             res.json({ 
//                 accessToken: accessToken, 
//                 refreshToken: newRefreshToken 
//             });
//         });
//     } catch (error) {
//         console.error('Server error while handling the refresh token:', error);
//         return res.status(500).json({'message': 'Internal Server error' });
//     }
// };

// module.exports = { handleRefreshToken };
const User = require('../mongodb/user');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    console.log('Handling refresh token request:', cookies);

    if (!cookies?.refreshToken) {
        console.log('No refresh token cookie present in the request.');
        return res.status(401).json({'message': 'No cookie found in session' });
    }

    const refreshToken = cookies.refreshToken;
    console.log('Refresh token found in cookies:', refreshToken);

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log('Refresh token is valid, generating new access token...');
        const user = await User.findById(decoded.id);

        if (!user) {
            console.log('No user found with the decoded token ID.');
            return res.status(404).json({ 'message': 'User not found' });
        }

        // Remove invalid or old refresh tokens
        user.refreshToken = user.refreshToken.filter(rt => {
            try {
                jwt.verify(rt, process.env.REFRESH_TOKEN_SECRET);
                return true; 
            } catch {
                return false; 
            }
        });

        // Generate new tokens
        const accessToken = jwt.sign(
            { "UserInfo": { "username": user.username, "id": user._id } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '2h' }
        );

        const newRefreshToken = jwt.sign(
            { "username": user.username, "id": user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Save the new refresh token, replacing the old one
        user.refreshToken.push(newRefreshToken);
        await user.save();

        console.log(`Tokens updated for user: ${user.username}`);

        // Set cookies
        res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'Lax', secure: false, maxAge: 2 * 60 * 60 * 1000 });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite: 'Lax', secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        console.error('Error validating or processing token:', error);
        return res.status(500).json({ 'message': 'Internal Server error' });
    }
};

module.exports = { handleRefreshToken };
