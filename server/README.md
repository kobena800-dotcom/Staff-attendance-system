# Staff Attendance Server

This folder contains a minimal Node/Express server to add server-side security to the Staff Attendance System.

Features in this initial commit:
- Device registration endpoint (issue a device token for kiosks)
- Signed QR token generation (/api/qr/:staffId) with nonce and expiry
- Server-side check-in and checkout endpoints that verify token signature, expiry and enforce single-use nonces
- SQLite storage for devices, attendance and used nonces
- Optional photo upload (dataURL) included with check-in

Quick start (local development)

1) Install dependencies

  cd server
  npm install

2) Create .env or set environment variables (optional)

  SECRET=replace_this_with_a_secret
  ADMIN_PASSWORD=some_admin_setup_password
  PORT=4000
  DB_FILE=./data.sqlite

3) Start server

  npm start

4) Endpoints

- POST /api/device/register { name } -> { token }
- GET /api/qr/:staffId?expirySeconds=120 -> { token, qrDataUrl }
- POST /api/checkin { token, deviceToken, photo? }
- POST /api/checkout { token, deviceToken }
- GET /api/attendance -> list (admin usage)

Client integration notes

- Replace the client-side processQRCodeCheckIn/Out flow to POST the scanned token to /api/checkin or /api/checkout along with a registered deviceToken.
- You can request a signed QR for printing from GET /api/qr/:staffId and use the returned qrDataUrl (data URL) to download a high-resolution PNG for printing.

Security notes

- This initial implementation uses HMAC SHA256 with the SECRET env var — keep SECRET safe and change it from the default.
- In production you should enable HTTPS, protect admin endpoints, and rotate device tokens as needed.
