const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const http     = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes     = require('./routes/auth');
const electionRoutes = require('./routes/elections');
const voteRoutes     = require('./routes/votes');

const app    = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

// Make io accessible in controllers
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/votes',     voteRoutes);
app.get('/', (req, res) => res.json({ message: 'VoteApp API running ✅' }));

// Socket.io — users join election rooms for live updates
io.on('connection', (socket) => {
  socket.on('joinElection', (electionId) => {
    socket.join(electionId);
  });
  socket.on('leaveElection', (electionId) => {
    socket.leave(electionId);
  });
});

// Connect MongoDB & start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT, () =>
      console.log(`✅ Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error('❌ DB error:', err));
