const User = require('../mongodb/user');

const validateUserRoles = async (req, res, next) => {
    const { identifier } = req.body;
    console.log(identifier, "identifier");

    if (!identifier) {
        console.log(identifier);
        console.log('MIDDLEWARE 1111111111')
        return res.status(403).json({ message: 'No identifier provided' });
    }


    console.log('MIDDLEWARE 3333333333')
    try {
        const user = await User.findOne({ 
            $or: [
            { email: identifier },
            { username: identifier }
            ]
         });
        console.log(user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.roles.includes('Admin')) {
            return res.status(401).json({ message: 'You do not have permission to access this page, please contact your closest admin to grant permission' });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = validateUserRoles;
