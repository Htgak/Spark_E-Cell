require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'spark-admin';
const validTokens = new Set();
const loginAttempts = new Map();

let getFirestore;
try {
  getFirestore = require('firebase-admin/lib/firestore/index.js').getFirestore;
} catch {
  try {
    getFirestore = require('firebase-admin/firestore').getFirestore;
  } catch {}
}

function initFirebase() {
  const apps = admin.apps || (admin.getApps && admin.getApps()) || [];
  if (apps.length) return;
  let credential;
  const certFn = admin.cert || (admin.credential && admin.credential.cert);
  const appDefaultFn = admin.applicationDefault || (admin.credential && admin.credential.applicationDefault);

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    credential = certFn(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    credential = certFn(require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)));
  } else if (appDefaultFn) {
    credential = appDefaultFn();
  }
  admin.initializeApp({
    credential
  });
}

try { initFirebase(); } catch (error) { console.warn('Firebase initialization deferred:', error.message); }
const db = () => {
  if (getFirestore) return getFirestore();
  if (typeof admin.firestore === 'function') return admin.firestore();
  throw new Error('Firestore module not available');
};
// Firebase Firestore is used EXCLUSIVELY for storing and scheduling blog posts
const postsCollection = () => db().collection('posts');

app.use(cors());
app.use(express.json({ limit: '12mb' }));

// Free local image storage directory
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'posts.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

// Local gallery helpers (Gallery stored locally, not on Firebase)
function readGallery() {
  if (!fs.existsSync(GALLERY_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(GALLERY_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeGallery(items) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(GALLERY_FILE, JSON.stringify(items, null, 2), 'utf8');
}

// One-time migration helper: Copies initial local blog posts into Firebase Firestore.
async function migrateLocalData() {
  if (!process.env.FIREBASE_MIGRATE_LOCAL_DATA || !fs.existsSync(DATA_FILE)) return;
  const records = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  for (const record of records) {
    if (record.id) await postsCollection().doc(String(record.id)).set(record, { merge: true });
  }
  console.log('Local blog posts have been migrated to Firebase Firestore.');
}
migrateLocalData().catch((error) => console.error('Local Firebase migration failed:', error));

function withStatus(post) {
  return { ...post, status: new Date(post.publishAt).getTime() <= Date.now() ? 'published' : 'scheduled' };
}

function cleanPostData(body) {
  const title = (body.title || '').trim();
  const content = (body.content || '').trim();
  const author = (body.author || '').trim() || 'Spark E-Cell';
  const category = (body.category || '').trim() || 'General';
  const excerpt = (body.excerpt || '').trim() || (content.slice(0, 140) + (content.length > 140 ? '...' : ''));
  const date = body.publishAt ? new Date(body.publishAt) : null;
  if (!title) return { error: 'Title is required' };
  if (!content) return { error: 'Content is required' };
  if (!date || Number.isNaN(date.getTime())) return { error: 'A valid publish date and time is required' };
  return { data: { title, author, content, category, excerpt, publishAt: date.toISOString() } };
}

function requireFirebase(req, res, next) {
  const apps = admin.apps || (admin.getApps && admin.getApps()) || [];
  if (!apps.length) return res.status(503).json({ error: 'Firebase is not configured. Set the Firebase service account and project settings on the server.' });
  next();
}

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/, '').trim();
  if (!token || !validTokens.has(token)) return res.status(401).json({ error: 'Unauthorized: missing, invalid or expired session token' });
  next();
}

async function listDocuments(collection) {
  const snapshot = await collection.get();
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

app.get('/api/posts', requireFirebase, async (_req, res, next) => {
  try {
    const posts = await listDocuments(postsCollection());
    res.json(posts.filter(p => new Date(p.publishAt).getTime() <= Date.now()).sort((a, b) => new Date(b.publishAt) - new Date(a.publishAt)).map(withStatus));
  } catch (error) { next(error); }
});

app.get('/api/posts/:id', requireFirebase, async (req, res, next) => {
  try {
    const doc = await postsCollection().doc(req.params.id).get();
    const post = doc.exists ? { ...doc.data(), id: doc.id } : null;
    if (!post || new Date(post.publishAt).getTime() > Date.now()) return res.status(404).json({ error: 'Post not found or not yet published' });
    res.json(withStatus(post));
  } catch (error) { next(error); }
});

app.post('/api/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const attempts = loginAttempts.get(ip) || { count: 0, last: Date.now() };
  if (Date.now() - attempts.last > 5 * 60 * 1000) attempts.count = 0;
  if (attempts.count >= 10) return res.status(429).json({ error: 'Too many failed login attempts. Please wait 5 minutes.' });
  const { password } = req.body || {};
  if (!password || password !== ADMIN_PASSWORD) {
    attempts.count += 1; attempts.last = Date.now(); loginAttempts.set(ip, attempts);
    return res.status(401).json({ error: 'Invalid admin password' });
  }
  loginAttempts.delete(ip);
  const token = crypto.randomBytes(32).toString('hex');
  validTokens.add(token);
  res.json({ token, message: 'Login successful' });
});

app.post('/api/logout', requireAuth, (req, res) => {
  validTokens.delete(req.headers.authorization.slice(7).trim());
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/admin/posts', requireFirebase, requireAuth, async (_req, res, next) => {
  try { res.json((await listDocuments(postsCollection())).map(withStatus).sort((a, b) => new Date(b.publishAt) - new Date(a.publishAt))); }
  catch (error) { next(error); }
});

app.post('/api/admin/posts', requireFirebase, requireAuth, async (req, res, next) => {
  try {
    const cleaned = cleanPostData(req.body);
    if (cleaned.error) return res.status(400).json({ error: cleaned.error });
    const post = { id: crypto.randomUUID(), ...cleaned.data, createdAt: new Date().toISOString() };
    await postsCollection().doc(post.id).set(post);
    res.status(201).json(withStatus(post));
  } catch (error) { next(error); }
});

app.put('/api/admin/posts/:id', requireFirebase, requireAuth, async (req, res, next) => {
  try {
    const ref = postsCollection().doc(req.params.id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Post not found' });
    const cleaned = cleanPostData(req.body);
    if (cleaned.error) return res.status(400).json({ error: cleaned.error });
    const post = { ...snapshot.data(), ...cleaned.data, updatedAt: new Date().toISOString() };
    await ref.set(post);
    res.json(withStatus(post));
  } catch (error) { next(error); }
});

app.delete('/api/admin/posts/:id', requireFirebase, requireAuth, async (req, res, next) => {
  try {
    const ref = postsCollection().doc(req.params.id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return res.status(404).json({ error: 'Post not found' });
    await ref.delete();
    res.json({ success: true, id: req.params.id });
  } catch (error) { next(error); }
});

app.get('/api/gallery', (_req, res) => {
  res.json(readGallery());
});

// Free storage helpers
async function uploadToCloudinary(base64Data) {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').replace(/['"]/g, '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || '').replace(/['"]/g, '').trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').replace(/['"]/g, '').trim();
  const uploadPreset = (process.env.CLOUDINARY_UPLOAD_PRESET || '').replace(/['"]/g, '').trim();

  const timestamp = Math.round(Date.now() / 1000);
  const formData = new URLSearchParams();
  formData.append('file', base64Data);

  if (uploadPreset && !uploadPreset.startsWith('cloudinary://')) {
    formData.append('upload_preset', uploadPreset);
  } else if (apiKey && apiSecret) {
    const signatureStr = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
  } else {
    throw new Error('Cloudinary credentials incomplete.');
  }

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Cloudinary upload failed.');
  }
  return data.secure_url;
}

async function uploadToImgBB(base64Data) {
  const apiKey = process.env.IMGBB_API_KEY;
  const pureBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  const formData = new URLSearchParams();
  formData.append('image', pureBase64);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!res.ok || !data.data?.url) {
    throw new Error(data.error?.message || 'ImgBB upload failed.');
  }
  return data.data.display_url || data.data.url;
}

function saveToLocalDisk(buffer, ext) {
  const filename = `${crypto.randomUUID()}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return `/uploads/${filename}`;
}

app.post('/api/admin/gallery/upload', requireAuth, async (req, res, next) => {
  try {
    const { name, type, data } = req.body || {};
    const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
    if (!extensions[type] || typeof data !== 'string') return res.status(400).json({ error: 'Upload a JPG, PNG, WebP or GIF image.' });
    const match = data.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match || match[1] !== type) return res.status(400).json({ error: 'The image data is invalid.' });
    const imageBuffer = Buffer.from(match[2], 'base64');
    if (!imageBuffer.length || imageBuffer.length > 8 * 1024 * 1024) return res.status(400).json({ error: 'Images must be smaller than 8 MB.' });

    let url;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      url = await uploadToCloudinary(data);
    } else if (process.env.IMGBB_API_KEY) {
      url = await uploadToImgBB(data);
    } else {
      url = saveToLocalDisk(imageBuffer, extensions[type]);
    }

    res.status(201).json({ url, name: path.basename(name || 'uploaded-image') });
  } catch (error) { next(error); }
});

app.post('/api/admin/gallery', requireAuth, (req, res) => {
  try {
    const { title, desc, url } = req.body || {};
    if (!url || !url.trim()) return res.status(400).json({ error: 'Image URL is required' });
    const items = readGallery();
    const item = { id: `gal-${crypto.randomUUID()}`, title: (title || 'Incubator Photo').trim(), desc: (desc || '').trim(), url: url.trim() };
    items.unshift(item);
    writeGallery(items);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add gallery image' });
  }
});

app.put('/api/admin/gallery/:id', requireAuth, (req, res) => {
  try {
    const { title, desc, url } = req.body || {};
    if (!url || !url.trim()) return res.status(400).json({ error: 'Image URL is required' });
    const items = readGallery();
    const index = items.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Gallery image not found' });
    const old = items[index];
    const item = { ...old, title: (title || old.title).trim(), desc: (desc !== undefined ? desc : old.desc).trim(), url: url.trim() };
    items[index] = item;
    writeGallery(items);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update gallery image' });
  }
});

app.delete('/api/admin/gallery/:id', requireAuth, (req, res) => {
  try {
    const items = readGallery();
    const index = items.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Gallery image not found' });
    items.splice(index, 1);
    writeGallery(items);
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', firebaseConfigured: Boolean((admin.apps || admin.getApps?.() || []).length), timestamp: new Date().toISOString() }));

const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res) => req.path.startsWith('/api') ? res.status(404).json({ error: 'Endpoint not found' }) : res.sendFile(path.join(clientDistPath, 'index.html')));
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'The request could not be completed. Check the Firebase server configuration and logs.' });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
