const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const { User, Post, Message } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// Makes the folder public to the internet so the frontend can see the images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Setup (Saves images directly to the backend/uploads folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), 
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log(err));

// Middleware: Auth (The Security Guard)
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// --- REST API ROUTES ---

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, usn, phone, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({ name, usn, phone, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { usn, password } = req.body;
    const user = await User.findOne({ usn });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    // Send back safe user data (No phone number)
    res.json({ token, user: { id: user._id, name: user.name, usn: user.usn, image: user.profileImage } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post Routes
app.post('/api/posts', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const newPost = new Post({
      userId: req.user.id,
      description: req.body.description,
      type: req.body.type,
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    // Populate user, but explicitly exclude phone and password
    const posts = await Post.find().populate('userId', 'name usn profileImage').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Post Route
app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Ensure only the owner can delete it
    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat History Route
app.get('/api/messages/:postId/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      postId: req.params.postId,
      $or: [
        { senderId: req.user.id, receiverId: req.params.otherUserId },
        { senderId: req.params.otherUserId, receiverId: req.user.id }
      ]
    })
    .populate('senderId', 'name usn') 
    .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- NEW: Inbox Route ---
app.get('/api/inbox', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all messages where I am the sender OR the receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
    .populate('senderId', 'name usn')
    .populate('receiverId', 'name usn')
    .populate('postId', 'description type')
    .sort({ createdAt: -1 });

    // Filter them down to unique conversations
    const uniqueConvos = [];
    const seen = new Set();

    messages.forEach(msg => {
      if (!msg.postId) return; // Ignore if the post was deleted

      // Figure out who the "other" person is in this text exchange
      const otherUser = msg.senderId._id.toString() === userId ? msg.receiverId : msg.senderId;
      const chatKey = `${msg.postId._id}-${otherUser._id}`; // Unique ID for this specific chat

      if (!seen.has(chatKey)) {
        seen.add(chatKey);
        uniqueConvos.push({
          postId: msg.postId._id,
          postType: msg.postId.type,
          postDesc: msg.postId.description,
          otherUser: otherUser,
          lastMessage: msg.message
        });
      }
    });

    res.json(uniqueConvos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SOCKET.IO REAL-TIME CHAT ---
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_chat', (data) => {
    const room = `${data.postId}-${[data.senderId, data.receiverId].sort().join('-')}`;
    socket.join(room);
  });

  socket.on('send_message', async (data) => {
    try {
      // Save to DB
      const newMessage = new Message({
        senderId: data.senderId,
        receiverId: data.receiverId,
        postId: data.postId,
        message: data.message
      });
      const savedMessage = await newMessage.save();

      // <-- THIS ADDS NAME & USN TO REAL-TIME MESSAGES
      const populatedMessage = await savedMessage.populate('senderId', 'name usn'); 

      // Emit to room
      const room = `${data.postId}-${[data.senderId, data.receiverId].sort().join('-')}`;
      io.to(room).emit('receive_message', populatedMessage);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));