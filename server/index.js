const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DB_FILE = path.join(__dirname, 'users.json');
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

app.use(cors());
app.use(express.json());

function readUsers() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    const users = data.users || [];
    const hasAdmin = users.some(u => u.username.toLowerCase() === 'admin');
    if (!hasAdmin) {
      const hash = bcrypt.hashSync('admin123', 10);
      const adminUser = { id: Date.now().toString(36), username: 'admin', passwordHash: hash };
      users.unshift(adminUser);
      writeUsers(users);
    }
    return users;
  } catch (err) {
    console.error('readUsers error', err);
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users }, null, 2));
}

function readSessions() {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: [] }, null, 2));
    }
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf8');
    const sessions = JSON.parse(raw).sessions || [];
    const cleaned = cleanSessions(sessions);
    if (cleaned.length !== sessions.length) {
      writeSessions(cleaned);
    }
    return cleaned;
  } catch (err) {
    console.error('readSessions error', err);
    return [];
  }
}

function writeSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions }, null, 2));
}

function cleanSessions(sessions) {
  const now = Date.now();
  return sessions.filter(session => !session.expiresAt || session.expiresAt > now);
}

function findSession(token) {
  const sessions = readSessions();
  return sessions.find(session => session.token === token);
}

function deleteSession(token) {
  const sessions = readSessions().filter(session => session.token !== token);
  writeSessions(sessions);
}

function touchSession(token) {
  const sessions = readSessions();
  const updated = sessions.map(session =>
    session.token === token ? { ...session, lastActiveAt: Date.now() } : session
  );
  writeSessions(updated);
}

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  const users = readUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Username exists' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(36), username, passwordHash: hash };
  users.push(user);
  writeUsers(users);
  return res.status(201).json({ ok: true });
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  const users = readUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const activeSessions = readSessions();
  if (activeSessions.length >= 20) {
    return res.status(429).json({ error: 'Maximum number of active sessions reached. Please logout from another device or try again later.' });
  }

  const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  const session = {
    token,
    userId: user.id,
    username: user.username,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  activeSessions.push(session);
  writeSessions(activeSessions);

  return res.json({ token, username: user.username });
});

// Auth middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const session = findSession(token);
    if (!session) return res.status(401).json({ error: 'Session is no longer active' });
    touchSession(token);
    req.user = payload;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/update-credentials', authMiddleware, async (req, res) => {
  const { newUsername, newPassword } = req.body || {};
  if (!newUsername || !newPassword) {
    return res.status(400).json({ error: 'Missing new username or password' });
  }

  const users = readUsers();
  const user = users.find(u => u.id === req.user.sub);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const usernameTaken = users.some(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== user.id);
  if (usernameTaken) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  user.username = newUsername;
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  writeUsers(users);

  const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, username: user.username });
});

app.post('/api/logout', authMiddleware, (req, res) => {
  deleteSession(req.token);
  return res.json({ ok: true });
});

// Get current user
app.get('/api/me', authMiddleware, (req, res) => {
  return res.json({ username: req.user.username });
});

// For demo: list users (DO NOT expose in production)
app.get('/api/users', (req, res) => {
  const users = readUsers().map(u => ({ id: u.id, username: u.username }));
  res.json(users);
});

app.listen(PORT, () => console.log(`Auth server listening on http://localhost:${PORT}`));
