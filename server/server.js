const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { initDb, db } = require('./db');
const { v4: uuidv4 } = require('uuid');

// Load env vars
const PORT = process.env.PORT || 4000;
const SECRET = process.env.SECRET || 'change_this_secret';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

initDb();

const app = express();
app.use(helmet());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use('/uploads', express.static(UPLOAD_DIR));

// Helper: HMAC sign
function signPayload(payloadB64) {
  return crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
}

function generateToken(payloadObj) {
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const sig = signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  const expected = signPayload(payloadB64);
  // timing-safe compare
  const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  if (!ok) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    return payload;
  } catch (e) {
    return null;
  }
}

// Device registration: create a device token
app.post('/api/device/register', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const token = uuidv4();
  const stmt = db.prepare('INSERT INTO devices (id, name, token, created_at) VALUES (?, ?, ?, ?)');
  stmt.run(uuidv4(), name, token, Date.now());
  stmt.finalize();
  res.json({ token, name });
});

// Generate a signed QR token for a staffId. Query param expirySeconds optional.
app.get('/api/qr/:staffId', async (req, res) => {
  const staffId = req.params.staffId;
  const expirySeconds = parseInt(req.query.expirySeconds || '120'); // default 2 minutes
  if (!staffId) return res.status(400).json({ error: 'staffId required' });

  const nonce = uuidv4();
  const payload = { staffId, exp: Date.now() + expirySeconds * 1000, nonce };
  const token = generateToken(payload);

  // Save nonce so we can prevent replay later if desired
  db.run('INSERT INTO nonces (nonce, created_at) VALUES (?, ?)', [nonce, Date.now()]);

  // Optionally return a QR as dataURL
  try {
    const qrDataUrl = await QRCode.toDataURL(token, { errorCorrectionLevel: 'H', margin: 4, width: 800 });
    res.json({ token, qrDataUrl });
  } catch (err) {
    res.json({ token });
  }
});

// Simple admin create-first (only if no admin exists). Use ADMIN_PASSWORD env to create initial admin.
app.post('/api/admin/setup', (req, res) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'invalid admin setup password' });
  // If admin exists, do nothing
  db.get('SELECT id FROM admins LIMIT 1', (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (row) return res.status(400).json({ error: 'admin already exists' });
    const id = uuidv4();
    const passHash = crypto.createHash('sha256').update(password).digest('hex');
    db.run('INSERT INTO admins (id, password_hash, created_at) VALUES (?, ?, ?)', [id, passHash, Date.now()]);
    res.json({ ok: true });
  });
});

// Check-in endpoint: accepts { token, deviceToken, photo (dataURL) }
app.post('/api/checkin', async (req, res) => {
  const { token, deviceToken, photo } = req.body;
  if (!token || !deviceToken) return res.status(400).json({ error: 'token and deviceToken required' });

  // Verify device
  db.get('SELECT id FROM devices WHERE token = ?', [deviceToken], (err, device) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!device) return res.status(401).json({ error: 'invalid device token' });

    // Verify token signature and payload
    const payload = verifyToken(token);
    if (!payload) return res.status(400).json({ error: 'invalid token signature' });

    if (payload.exp && payload.exp < Date.now()) return res.status(400).json({ error: 'token expired' });

    // Prevent replay by checking nonce table
    if (!payload.nonce) return res.status(400).json({ error: 'token must include nonce' });

    db.get('SELECT nonce FROM used_nonces WHERE nonce = ?', [payload.nonce], (err, row) => {
      if (err) return res.status(500).json({ error: 'db error' });
      if (row) return res.status(400).json({ error: 'token already used' });

      // Save photo if provided
      let photoUrl = null;
      if (photo && photo.startsWith('data:')) {
        const matches = photo.match(/^data:(image\/(png|jpeg|jpg));base64,(.*)$/);
        if (matches) {
          const ext = matches[2] === 'png' ? 'png' : 'jpg';
          const data = matches[3];
          const filename = `${uuidv4()}.${ext}`;
          const filepath = path.join(UPLOAD_DIR, filename);
          fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
          photoUrl = `/uploads/${filename}`;
        }
      }

      // Record attendance
      const staffId = payload.staffId || 'UNKNOWN';
      const time = Date.now();
      const id = uuidv4();
      db.run('INSERT INTO attendance (id, staff_id, device_id, time, photo_url, token_nonce) VALUES (?, ?, ?, ?, ?, ?)',
        [id, staffId, device.id, time, photoUrl, payload.nonce]);

      // Mark nonce used
      db.run('INSERT INTO used_nonces (nonce, used_at) VALUES (?, ?)', [payload.nonce, Date.now()]);

      res.json({ ok: true, staffId, time, photoUrl });
    });
  });
});

// Simple checkout endpoint (same flow)
app.post('/api/checkout', (req, res) => {
  const { token, deviceToken } = req.body;
  if (!token || !deviceToken) return res.status(400).json({ error: 'token and deviceToken required' });
  db.get('SELECT id FROM devices WHERE token = ?', [deviceToken], (err, device) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!device) return res.status(401).json({ error: 'invalid device token' });

    const payload = verifyToken(token);
    if (!payload) return res.status(400).json({ error: 'invalid token signature' });
    if (payload.exp && payload.exp < Date.now()) return res.status(400).json({ error: 'token expired' });

    if (!payload.nonce) return res.status(400).json({ error: 'token must include nonce' });
    db.get('SELECT nonce FROM used_nonces WHERE nonce = ?', [payload.nonce], (err, row) => {
      if (err) return res.status(500).json({ error: 'db error' });
      if (row) return res.status(400).json({ error: 'token already used' });

      const staffId = payload.staffId || 'UNKNOWN';
      const time = Date.now();
      const id = uuidv4();
      db.run('INSERT INTO attendance (id, staff_id, device_id, time, photo_url, token_nonce, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, staffId, device.id, time, null, payload.nonce, 'checkout']);

      db.run('INSERT INTO used_nonces (nonce, used_at) VALUES (?, ?)', [payload.nonce, Date.now()]);

      res.json({ ok: true, staffId, time });
    });
  });
});

// Simple endpoint to list attendance (for admin) — WARNING: In production protect this with auth
app.get('/api/attendance', (req, res) => {
  db.all('SELECT * FROM attendance ORDER BY time DESC LIMIT 500', (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Staff attendance server running on port ${PORT}`);
});
