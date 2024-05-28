const User = require('../mongodb/user');
const validator = require('validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const handleNewUser = async (req, res) => {
    let { username, email, password, confirmPassword } = req.body;

    // Sanitize and validate user inputs
    username = validator.trim(validator.escape(username));
    email = validator.normalizeEmail(validator.trim(email), {
        gmail_remove_dots: false,
    });
        password = validator.escape(password);
    confirmPassword = validator.escape(confirmPassword);

    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ 'message': 'All fields must have a value' });
    }

    if (!validator.isEmail(email)) {
        const message = email.trim() === ''
            ? 'Email field is empty.'
            : 'Please enter a valid email address.';
        return res.status(400).json({ 'message': message });
    }

    const passwordStrengthRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{4,}$/;

    // Check if the password matches the required pattern
    if (!passwordStrengthRegex.test(password)) {
        return res.status(400).json({ 'message': 'Password does not meet the strength requirements. It must be at least 4 characters long, include a number, an uppercase letter, and a lowercase letter.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ 'message': 'Passwords must match' });
    }

    const duplicator = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username }]
    }).exec();

    if (duplicator) {
        return res.status(409).json({ 'message': 'User already exists' });
    }

    // Generate a verification token
    const verifyToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
    const expireTime = Date.now() + 3600000; // 1 hour from now

    // Send a verification email to the user
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

    const verifyUrl = `http://localhost:5173/verifyToken?token=${verifyToken}`;

    try {
        await transporter.sendMail({
            from: '"Tasker" <support@Tasker.com>',
            to: email,
            subject: 'Account activation',
            html: `Please click on the following link to activate your account: <a href="${verifyUrl}">${verifyUrl}</a>. This link will expire in 1 hour.`
        });
        console.log("Verification email sent successfully to:", email);

        // Temporarily store the verification token in the database
        const newUser = new User({
            username: username,
            email: email.toLowerCase(),
            password: password, 
            verifyTokens: [{
                token: hashedToken,
                expires: expireTime
            }],
            verified: false
        });

        await newUser.save();

        res.status(200).json({ 'message': 'Verification link has been sent to your email address.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 'message': 'Failed to send the verification email' });
    }
};

module.exports = { handleNewUser };
