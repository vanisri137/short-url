# ✂️ Sniply — URL Shortener

A production-ready full-stack URL shortening service built with Node.js, Express, MongoDB, and React.

---

## 📸 Screenshots

> Add screenshots to `/docs/screenshots/` and reference them here.

| Dashboard | Analytics | QR Code |
|-----------|-----------|---------|
| `dashboard.png` | `analytics.png` | `qr.png` |

---

## ✨ Features

- 🔗 Shorten any valid URL instantly
- 🏷️ Custom aliases (e.g. `short/my-link`)
- ⏰ Optional expiration dates
- 📊 Click tracking & analytics dashboard
- 📋 One-click copy to clipboard
- ⬛ QR code generation + download
- 🔍 Search, sort, and paginate URLs
- 🔴 Activate / deactivate links
- 🗑️ Delete URLs

---

## 🗂️ Project Structure

```
url-shortener/
│
├── server/                    # Node.js + Express backend
│   ├── config/
│   │   └── db.js              # MongoDB Atlas connection
│   ├── controllers/
│   │   └── urlController.js   # All business logic
│   ├── middleware/
│   │   ├── errorHandler.js    # Centralized error handling
│   │   └── rateLimiter.js     # express-rate-limit setup
│   ├── models/
│   │   └── Url.js             # Mongoose schema
│   ├── routes/
│   │   └── urlRoutes.js       # API routes + validation
│   ├── utils/
│   │   ├── nanoidHelper.js    # Collision-free ID generation
│   │   └── urlValidator.js    # URL format validation
│   ├── server.js              # Express entry point
│   ├── .env.example
│   └── package.json
│
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analytics.js        # Recharts dashboard
│   │   │   ├── CreatedUrlBanner.js # Success banner
│   │   │   ├── QrButton.js         # QR code modal
│   │   │   ├── UrlForm.js          # URL creation form
│   │   │   └── UrlTable.js         # URL list table
│   │   ├── hooks/
│   │   │   ├── useUrls.js          # URL CRUD hook
│   │   │   └── useAnalytics.js     # Analytics fetch hook
│   │   ├── pages/
│   │   │   └── Dashboard.js        # Main dashboard
│   │   ├── services/
│   │   │   └── api.js              # Axios service layer
│   │   ├── utils/
│   │   │   └── helpers.js          # Formatting utilities
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/index.html
│   ├── vercel.json
│   └── package.json
│
├── render.yaml                # Render deploy config
├── package.json               # Root dev convenience scripts
└── README.md
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)

| Variable | Example | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `BASE_URL` | `https://your-api.onrender.com` | Used to construct short URLs |
| `CLIENT_URL` | `https://your-app.vercel.app` | CORS allowed origin |
| `NODE_ENV` | `production` | Environment |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

### Client (`client/.env`)

| Variable | Example | Description |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `https://your-api.onrender.com` | Backend API URL |
| `REACT_APP_BASE_SHORT_URL` | `https://your-api.onrender.com` | Base URL for short links |

---

## 🚀 Installation

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

### 2. Install dependencies

```bash
# Install all (root + server + client)
npm run install:all

# Or individually:
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and URLs

# Client
cp client/.env.example client/.env
# Edit client/.env with your API base URL
```

### 4. Run in development

```bash
# From root — runs both server and client concurrently:
npm install  # installs concurrently
npm run dev

# Or separately:
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:3000
```

---

## 🌐 Deployment

### Backend → Render

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service → connect repo
3. Set root directory to `server`
4. Set environment variables in the Render dashboard
5. Deploy — the `render.yaml` config handles the rest

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → connect repo
2. Set root directory to `client`
3. Add environment variables:
   - `REACT_APP_API_BASE_URL` = your Render service URL
   - `REACT_APP_BASE_SHORT_URL` = your Render service URL
4. Deploy

---

## 📡 API Reference

### `POST /api/urls` — Create Short URL

```json
// Request
{ "url": "https://example.com/long/path", "customAlias": "my-link", "expiresAt": "2025-12-31T00:00:00Z" }

// Response 201
{ "success": true, "data": { "shortUrl": "https://api.../my-link", "shortUrlId": "my-link", "clicks": 0, ... } }
```

### `GET /:shortUrlId` — Redirect

Redirects (301) to original URL, increments click count + updates `lastAccessed`.

### `GET /api/urls` — List URLs

Query params: `page`, `limit`, `search`, `sortBy`, `sortOrder`

### `GET /api/urls/analytics` — Analytics

Returns: `totalUrls`, `totalClicks`, `avgClicks`, `topUrls[]`, `recentUrls[]`

### `DELETE /api/urls/:id` — Delete URL

### `PATCH /api/urls/:id/toggle` — Toggle Active Status

### `GET /health` — Health Check

---

## 🔒 Security

- **Helmet** — secure HTTP headers
- **CORS** — origin whitelist
- **Rate limiting** — 100 req/15min global; 20 req/min for POST `/api/urls`
- **Input validation** — `express-validator` on all inputs
- **URL validation** — rejects private IPs, bare words, non-HTTP(S) protocols
- **Environment variables** — no secrets in code

---

## 🧬 NanoID Collision Handling

Short IDs are generated using NanoID with a custom alphanumeric alphabet (62 chars, length 7):

- **62⁷ ≈ 3.5 trillion** possible combinations
- Before saving, the generated ID is checked against MongoDB for uniqueness
- If a collision is found, a new ID is generated (up to 5 retries)
- After 50% of retries exhausted, ID length is automatically increased
- Probability of collision at 1M records ≈ **0.00014%**

---

## 🎯 Resume-Ready Project Statements

- Designed and implemented a URL shortening service using Node.js, Express.js, MongoDB, and NanoID
- Built collision-free short code generation with database-backed uniqueness checks and automatic retry logic
- Developed REST APIs for URL creation, analytics, deletion, and redirection with full validation and error handling
- Implemented click tracking and last-access analytics using MongoDB atomic update operations
- Built a responsive React dashboard for URL management, analytics visualization (Recharts), QR code generation, search, sort, and pagination
- Secured the API with Helmet, CORS, rate limiting, and express-validator input validation

---

## 📄 License

MIT
