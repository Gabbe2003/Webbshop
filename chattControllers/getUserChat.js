const Message = require('../models/messages');

const getUserMessages =  async (req, res) => {
    try {
      const userId = req.query.userId; 
      if (!userId) {
        return res.status(400).send('User ID is required');
      }
      const messages = await Message.find({ owner: userId }).populate('owner', 'username');
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving messages');
    }
  };

  module.exports = { getUserMessages };
