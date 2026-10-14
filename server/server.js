require('dotenv').config();          // Load .env → process.env
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'spark-admin';

// In-memory valid bearer tokens
const validTokens = new Set();

// Simple in-memory rate limiting for login attempts
const loginAttempts = new Map();

app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'posts.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

// Ensure data directory and file exist
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(GALLERY_FILE)) {
    fs.writeFileSync(GALLERY_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

initStorage();

function loadPosts() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read posts.json, returning empty array:', err);
    return [];
  }
}

function savePosts(posts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

function loadGallery() {
  try {
    const raw = fs.readFileSync(GALLERY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read gallery.json, returning empty array:', err);
    return [];
  }
}

function saveGallery(items) {
  fs.writeFileSync(GALLERY_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

// Compute status based on current UTC time
function withStatus(post) {
  const isPublished = new Date(post.publishAt).getTime() <= Date.now();
  return {
    ...post,
    status: isPublished ? 'published' : 'scheduled'
  };
}

// Validation helper
function cleanPostData(body) {
  const title = (body.title || '').trim();
  const content = (body.content || '').trim();
  const author = (body.author || '').trim() || 'Spark E-Cell';
  const category = (body.category || '').trim() || 'General';
  const excerpt = (body.excerpt || '').trim() || (content.slice(0, 140) + (content.length > 140 ? '...' : ''));
  const publishAt = body.publishAt ? new Date(body.publishAt).toISOString() : null;

  if (!title) {
    return { error: 'Title is required' };
  }
  if (!content) {
    return { error: 'Content is required' };
  }
  if (!publishAt || isNaN(new Date(publishAt).getTime())) {
    return { error: 'A valid publish date and time is required' };
  }

  return {
    data: {
      title,
      author,
      content,
      category,
      excerpt,
      publishAt
    }
  };
}

// Authentication middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7).trim();
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired session token' });
  }

  next();
}

// ------------------------------------
// Public Endpoints
// ------------------------------------

// GET /api/posts - Public list of published posts, newest first
app.get('/api/posts', (req, res) => {
  const posts = loadPosts();
  const now = Date.now();

  const publishedPosts = posts
    .filter(post => new Date(post.publishAt).getTime() <= now)
    .sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime())
    .map(withStatus);

  res.json(publishedPosts);
});

// GET /api/posts/:id - Public single post
app.get('/api/posts/:id', (req, res) => {
  const posts = loadPosts();
  const now = Date.now();
  const post = posts.find(p => p.id === req.params.id);

  if (!post || new Date(post.publishAt).getTime() > now) {
    return res.status(404).json({ error: 'Post not found or not yet published' });
  }

  res.json(withStatus(post));
});

// ------------------------------------
// Auth Endpoint
// ------------------------------------

// POST /api/login - Exchange password for session token
app.post('/api/login', (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const attempts = loginAttempts.get(clientIp) || { count: 0, last: Date.now() };

  // Reset attempt count if over 5 minutes have passed
  if (Date.now() - attempts.last > 5 * 60 * 1000) {
    attempts.count = 0;
  }

  if (attempts.count >= 10) {
    return res.status(429).json({ error: 'Too many failed login attempts. Please wait 5 minutes.' });
  }

  const { password } = req.body || {};
  if (!password || password !== ADMIN_PASSWORD) {
    attempts.count += 1;
    attempts.last = Date.now();
    loginAttempts.set(clientIp, attempts);
    return res.status(401).json({ error: 'Invalid admin password' });
  }

  // Clear failed count on successful login
  loginAttempts.delete(clientIp);

  // Generate a cryptographically secure random token
  const token = crypto.randomBytes(32).toString('hex');
  validTokens.add(token);

  res.json({ token, message: 'Login successful' });
});

// POST /api/logout - Invalidate session token
app.post('/api/logout', requireAuth, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.slice(7).trim();
  validTokens.delete(token);
  res.json({ message: 'Logged out successfully' });
});

// ------------------------------------
// Admin Endpoints
// ------------------------------------

// GET /api/admin/posts - List all posts (both published and scheduled)
app.get('/api/admin/posts', requireAuth, (req, res) => {
  const posts = loadPosts();
  const sorted = posts
    .map(withStatus)
    .sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime());

  res.json(sorted);
});

// POST /api/admin/posts - Create post
app.post('/api/admin/posts', requireAuth, (req, res) => {
  const cleaned = cleanPostData(req.body);
  if (cleaned.error) {
    return res.status(400).json({ error: cleaned.error });
  }

  const posts = loadPosts();
  const newPost = {
    id: crypto.randomUUID ? crypto.randomUUID() : 'post-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    ...cleaned.data,
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  savePosts(posts);

  res.status(201).json(withStatus(newPost));
});

// PUT /api/admin/posts/:id - Update post
app.put('/api/admin/posts/:id', requireAuth, (req, res) => {
  const posts = loadPosts();
  const index = posts.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const cleaned = cleanPostData(req.body);
  if (cleaned.error) {
    return res.status(400).json({ error: cleaned.error });
  }

  const existing = posts[index];
  const updatedPost = {
    ...existing,
    ...cleaned.data,
    updatedAt: new Date().toISOString()
  };

  posts[index] = updatedPost;
  savePosts(posts);

  res.json(withStatus(updatedPost));
});

// DELETE /api/admin/posts/:id - Delete post
app.delete('/api/admin/posts/:id', requireAuth, (req, res) => {
  const posts = loadPosts();
  const index = posts.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const [removed] = posts.splice(index, 1);
  savePosts(posts);

  res.json({ success: true, id: removed.id });
});

// ------------------------------------
// Gallery Endpoints
// ------------------------------------

// GET /api/gallery - Public list of gallery photos
app.get('/api/gallery', (req, res) => {
  const gallery = loadGallery();
  res.json(gallery);
});

// POST /api/admin/gallery/upload - Save an image for the public gallery
app.post('/api/admin/gallery/upload', requireAuth, (req, res) => {
  const { name, type, data } = req.body || {};
  const allowedTypes = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  const extension = allowedTypes[type];
  if (!extension || typeof data !== 'string') {
    return res.status(400).json({ error: 'Upload a JPG, PNG, WebP or GIF image.' });
  }

  const match = data.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match || match[1] !== type) {
    return res.status(400).json({ error: 'The image data is invalid.' });
  }

  const imageBuffer = Buffer.from(match[2], 'base64');
  if (!imageBuffer.length || imageBuffer.length > 8 * 1024 * 1024) {
    return res.status(400).json({ error: 'Images must be smaller than 8 MB.' });
  }

  const uploadDir = path.join(__dirname, 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });
  const filename = `${crypto.randomBytes(16).toString('hex')}.${extension}`;
  fs.writeFileSync(path.join(uploadDir, filename), imageBuffer, { flag: 'wx' });
  res.status(201).json({ url: `/uploads/${filename}`, name: path.basename(name || filename) });
});

// POST /api/admin/gallery - Add new gallery image
app.post('/api/admin/gallery', requireAuth, (req, res) => {
  const { title, desc, url } = req.body || {};
  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  const gallery = loadGallery();
  const newItem = {
    id: 'gal-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    title: (title || 'Incubator Photo').trim(),
    desc: (desc || '').trim(),
    url: url.trim()
  };

  gallery.push(newItem);
  saveGallery(gallery);
  res.status(201).json(newItem);
});

// PUT /api/admin/gallery/:id - Update existing gallery image
app.put('/api/admin/gallery/:id', requireAuth, (req, res) => {
  const gallery = loadGallery();
  const index = gallery.findIndex(g => g.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Gallery image not found' });
  }

  const { title, desc, url } = req.body || {};
  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  const updated = {
    ...gallery[index],
    title: (title || gallery[index].title).trim(),
    desc: (desc !== undefined ? desc : gallery[index].desc).trim(),
    url: url.trim()
  };

  gallery[index] = updated;
  saveGallery(gallery);
  res.json(updated);
});

// DELETE /api/admin/gallery/:id - Delete gallery image
app.delete('/api/admin/gallery/:id', requireAuth, (req, res) => {
  const gallery = loadGallery();
  const index = gallery.findIndex(g => g.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Gallery image not found' });
  }

  const [removed] = gallery.splice(index, 1);
  saveGallery(gallery);
  res.json({ success: true, id: removed.id });
});

// ------------------------------------
// Health Check & Root Info
// ------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const clientDistPath = path.join(__dirname, '../client/dist');

app.get('/', (req, res, next) => {
  if (fs.existsSync(clientDistPath)) {
    return next();
  }
  res.json({
    status: 'online',
    message: 'Spark E-Cell Backend API is running successfully',
    endpoints: {
      posts: '/api/posts',
      gallery: '/api/gallery',
      health: '/api/health'
    }
  });
});

// ------------------------------------
// Production Static Files & SPA Fallback
// ------------------------------------
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.use((req, res) => {
    // If it's an API request that didn't match, return 404 JSON
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
