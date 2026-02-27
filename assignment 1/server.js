const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// ⚠️ INTENTIONALLY INSECURE: No environment variables, hardcoded config
const MONGODB_URI = 'mongodb://mongo:27017/insecure-webapp';
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// ⚠️ INTENTIONALLY INSECURE: Simple session without proper security
app.use(session({
  secret: 'super-secret-key', // Hardcoded secret
  resave: false,
  saveUninitialized: true
}));

// MongoDB Connection
mongoose.connect(MONGODB_URI).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.log('MongoDB connection error:', err);
});

// Models
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // ⚠️ Stored as plain text - INTENTIONALLY INSECURE
  bio: String,
  profilePic: String,
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  username: String,
  title: String,
  content: String, // ⚠️ No XSS protection - allows HTML/JS
  image: String,
  createdAt: { type: Date, default: Date.now }
});

const imageSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  filename: String,
  path: String,
  uploadedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Image = mongoose.model('Image', imageSchema);

// File Upload Configuration
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ⚠️ INTENTIONALLY INSECURE: No authentication middleware
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register endpoint - ⚠️ INTENTIONALLY INSECURE
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // ⚠️ No input validation, no duplicate check
    const user = new User({
      username: username,
      email: email,
      password: password // ⚠️ NO HASHING
    });

    await user.save();
    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Login endpoint - ⚠️ INTENTIONALLY INSECURE
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // ⚠️ Plain text password comparison
    const user = await User.findOne({ username: username });
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.password === password) {
      // ⚠️ Simple session - no secure flags
      req.session.userId = user._id;
      req.session.username = user.username;
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.json({ success: false, message: 'Invalid password' });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Get user profile - ⚠️ No authentication check
app.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.json(user);
    } else {
      res.json({ error: 'User not found' });
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Update profile - ⚠️ No authentication, no validation
app.post('/profile/update', async (req, res) => {
  try {
    const { userId, username, bio, email } = req.body;
    
    // ⚠️ Direct update without any validation or auth check
    await User.findByIdAndUpdate(userId, {
      username: username,
      bio: bio,
      email: email
    });

    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Change password - ⚠️ INTENTIONALLY INSECURE
app.post('/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    
    const user = await User.findById(userId);
    
    // ⚠️ Plain text password comparison
    if (user.password === oldPassword) {
      user.password = newPassword; // ⚠️ No hashing
      await user.save();
      res.json({ success: true, message: 'Password changed' });
    } else {
      res.json({ success: false, message: 'Old password incorrect' });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Upload image - ⚠️ No file validation
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, error: 'No file uploaded' });
    }

    const image = new Image({
      userId: req.body.userId,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    });

    await image.save();
    res.json({ success: true, path: `/uploads/${req.file.filename}` });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Get user gallery
app.get('/gallery/:userId', async (req, res) => {
  try {
    const images = await Image.find({ userId: req.params.userId });
    res.json(images);
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Create post - ⚠️ No input validation, allows XSS
app.post('/create-post', async (req, res) => {
  try {
    const { userId, username, title, content, image } = req.body;
    
    // ⚠️ Direct database insert without validation
    const post = new Post({
      userId: userId,
      username: username,
      title: title,
      content: content, // ⚠️ XSS vulnerability - content rendered as HTML
      image: image
    });

    await post.save();
    res.json({ success: true, message: 'Post created' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Get all posts - ⚠️ No pagination, returns all
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Search posts - ⚠️ INTENTIONALLY INSECURE - SQL/NoSQL Injection vulnerable
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    
    // ⚠️ INSECURE: Direct regex search - vulnerable to ReDoS attacks
    // In a real MongoDB query, this could allow injection
    const results = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    });

    res.json(results);
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Get user posts
app.get('/user-posts/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId });
    res.json(posts);
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out' });
});

// Serve uploads folder
app.use('/uploads', express.static('uploads'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
