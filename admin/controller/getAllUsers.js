const User = require('../../mongodb/user');

const getAllUsers = async (req, res) => {
    const { username } = req.query; 


    let query = {};
    if (username) query.username = { $regex: username, $options: 'i' };

    try {
        const users = await User.find(query);
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found with the provided username.' });
        }
        res.json(users);
    } catch (error) {
        console.error('Error while trying to retrieve users:', error);
        res.status(500).json({ message: 'Error while trying to retrieve the users', error });
    }
};

module.exports = { getAllUsers };
