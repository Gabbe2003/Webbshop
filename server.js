require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const cookieParser = require('cookie-parser');
const verifyJWT = require('./middleware/verifyJWTToken');
const verifyUser = require('./middleware/verifyUser');
const rolesController = require('./middleware/verifyRoles');
const corsOptions = require('./settings/cors');
const path = require('path');
const PORT = 9000;
const http = require('http');
const app = express();
const server = http.createServer(app);
const Message = require('./models/messages');

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('tiny'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('./views', express.static(path.join(__dirname, 'views')));

io.on('connection', (socket) => {
  socket.on('chat message', async (msg) => {
    try {
      // Create a new message instance and save it to the database
      const message = new Message({
        owner: msg.user, // Ensure that 'user' here is the ObjectId of the user
        text: msg.text,
        media: msg.media // if any media is attached
      });
      await message.save();
      console.log(message)
      
      // Broadcast the message to other clients
      io.emit('chat message', msg);
    } catch (error) {
      console.error('Failed to save message:', error);
      // Optionally, emit an error back to the sender
    }
  });
});



app.use('/', require('./routes/user/userOperations'));
app.use('/', verifyUser, require('./routes/user/verifiedUserOperations'));
app.use('/', verifyUser, verifyJWT, require('./routes/user/inloggedVerifiedUsers'));
app.use('/', verifyUser, verifyJWT, rolesController, require('./routes/admin/adminOperations'));

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
