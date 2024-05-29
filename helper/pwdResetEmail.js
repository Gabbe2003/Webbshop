const User = require('../models/user');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer');

const handlePWDReset = async (req, res) => {
    const { email } = req.body;
    console.log("Received password reset request for:", email);

    if (!email) {
        console.log("No email provided in request");
        return res.status(400).json({ 'message': 'No email provided' });
    }

    const foundUser = await User.findOne({ email: email }).exec();

    if (!foundUser) {
        console.log("User not found:", email);
        return res.status(401).json({ 'message' :  'No user found with the provided email' });
    }

    console.log("User found:", foundUser.email);

    const resetToken = crypto.randomBytes(20).toString('hex');
    console.log("Generated reset token:", resetToken);

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex'); 
    console.log("Hashed token:", hashedToken);

    const expireTime = Date.now() + 3600000; // 1 hour from now
    console.log("Token expiry time:", new Date(expireTime).toISOString());

    foundUser.verifyTokens.push({
        token: hashedToken,
        expires: new Date(expireTime)
    });
    

    await foundUser.save();
    console.log("Updated user with reset token and expiry.");

    const resetURL = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log("Reset URL:", resetURL);
    
    // Set up Nodemailer transport
    const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: process.env.PORT,
        secure: false, 
        service: process.env.SERVICE,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
    });
    
    // Attempt to send the email
    try {
        await transporter.sendMail({
            from: '"Tasker" <support@Tasker.com>',
            to: foundUser.email,
            subject: 'Password Reset',
            html: `Please click on the following link to reset your password: <a href="${resetURL}">${resetURL}</a>. This link will expire in 1 hour.`
        });
        console.log("Password reset email sent successfully to:", foundUser.email);
        res.status(200).json({ 'message': 'Password reset link has been sent to your email address.' });
    } catch (error) {
        console.error("Failed to send password reset email:", error);
        res.status(500).json({ 'message': 'Failed to send password reset email.' });
    }
};

module.exports = { handlePWDReset };
