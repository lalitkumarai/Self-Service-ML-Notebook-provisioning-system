console.log('Starting backend...');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
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
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.io Middleware for Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
  if (!token) return next(new Error('Authentication error: No token provided'));
  const tokenString = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
  jwt.verify(tokenString, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error: Invalid token'));
    socket.user = decoded;
    next();
  });
});

// Security & logging middleware — helmet must come first
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',   // Set CORS_ORIGIN env var in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Serve uploaded datasets statically (optional)
app.use('/uploads', express.static(path.join(__dirname, '../notebook_data/datasets')));

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const notebookRoutes = require('./routes/notebookRoutes');
const templateRoutes = require('./routes/templateRoutes');
const experimentRoutes = require('./routes/experimentRoutes');
const datasetRoutes = require('./routes/datasetRoutes');

app.use('/auth', authRoutes);
app.use('/api/notebook', notebookRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/datasets', datasetRoutes);

app.get('/', (req, res) => res.send('ML Notebook API is running...'));

// ─── Idle Auto-Shutdown Cron ──────────────────────────────────────────────────
const Notebook = require('./models/Notebook');
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

setInterval(async () => {
  if (process.env.SKIP_DB === 'true') return;
  try {
    const cutoff = new Date(Date.now() - IDLE_TIMEOUT_MS);
    // Find running notebooks that haven't been updated in 30 min
    const idleNotebooks = await Notebook.find({
      status: 'Running',
      autoShutdown: true,
      updatedAt: { $lt: cutoff },
    });

    for (const nb of idleNotebooks) {
      console.log(`[AutoShutdown] Stopping idle notebook: ${nb.name} (${nb._id})`);
      nb.status = 'Stopped';
      await nb.save();
      // Emit notification to any connected sockets for this notebook
      io.emit(`notebook:idle_shutdown:${nb._id}`, { notebookId: nb._id, name: nb.name });
    }
  } catch (err) {
    console.error('[AutoShutdown] Error:', err.message);
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// ─── Socket.io Events ─────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    kernelService.startSession(socket.id, io);

    socket.on('execute_code', (data) => {
        const { code, cellId } = data;
        kernelService.executeCode(socket.id, code, cellId);
    });

    // Heartbeat: client pings to indicate activity, prevent auto-shutdown
    socket.on('notebook:heartbeat', async ({ notebookId }) => {
      try {
        await Notebook.findByIdAndUpdate(notebookId, { updatedAt: new Date() });
      } catch (e) { /* ignore */ }
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
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
