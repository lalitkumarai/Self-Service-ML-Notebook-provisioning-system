console.log('Starting backend...');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const kernelService = require('./services/kernelService');
const jwt = require('jsonwebtoken');

dotenv.config();

if (process.env.SKIP_DB !== 'true') {
  connectDB();
} else {
  console.log('Skipping DB connection (SKIP_DB=true)');
}

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

// Socket.io Middleware for Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  // Handle "Bearer <token>" format
  const tokenString = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

  jwt.verify(tokenString, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded;
    next();
  });
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

const authRoutes = require('./routes/authRoutes');
const notebookRoutes = require('./routes/notebookRoutes');

app.use('/auth', authRoutes);
app.use('/api/notebook', notebookRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Socket.io Events
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Initialize kernel session for this socket
    kernelService.startSession(socket.id, io);

    socket.on('execute_code', (data) => {
        // data: { code: string, cellId: string }
        const { code, cellId } = data;
        kernelService.executeCode(socket.id, code, cellId);
    });

    socket.on('restart_kernel', () => {
        kernelService.restartSession(socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        kernelService.stopSession(socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
