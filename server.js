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

const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true
  },
});

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('tiny'));


app.use(express.static(path.join(__dirname, 'public')));
app.use('./views', express.static(path.join(__dirname, 'views')));

app.get('/test', function (req, res) {
  const options = {
      root: path.join(__dirname)
  };
  const fileName = 'views/test.html';
  res.sendFile(fileName, options, function (err) {
      if (err) {
          console.error('Error sending file:', err);
      } else {
          console.log('Sent:', fileName);
      }
  });
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });
});

io.on('connect', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use('/', require('./routes/user/userOperations'));
app.use('/', verifyUser, require('./routes/user/verifiedUserOperations'));
app.use('/', verifyUser, verifyJWT, require('./routes/user/inloggedVerifiedUsers'));
app.use('/', verifyUser, verifyJWT, rolesController, require('./routes/admin/adminOperations'));

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on Port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
