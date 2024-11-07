const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const postRoutes = require('./routes/posts');
const Post = require('./models/Post');
require('dotenv').config();

const app = express();

// Check if MONGO_URI is provided
if (!process.env.MONGO_URI) {
  console.error("MongoDB URI not provided in environment variables.");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the app if MongoDB connection fails
  });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine for EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API Routes
app.use('/api/posts', postRoutes);

// EJS View Routes

// Render homepage with all posts
app.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.render('index', { posts: posts });
  } catch (error) {
    console.error("Error loading posts:", error);
    res.status(500).send('Error loading posts');
  }
});

// Render form for creating a new post
app.get('/new-post', (req, res) => {
  res.render('newpost');
});

// Handle form submission for creating a new post
app.post('/new-post', async (req, res) => {
  const { title, description, content, image } = req.body;
  const newPost = new Post({ title, description, content, image });
  try {
    await newPost.save();
    res.redirect('/');
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(400).send('Error saving post');
  }
});

// View a single post by ID
app.get('/post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');
    res.render('post', { post });
  } catch (error) {
    console.error("Error loading post:", error);
    res.status(500).send('Error loading post');
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
