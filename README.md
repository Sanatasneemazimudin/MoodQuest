# 🌿 MoodQuest — MERN Stack

> A full-stack mental wellness app built with **MongoDB · Express · React · Node.js**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **M** — Database | MongoDB + Mongoose ODM |
| **E** — Backend | Express.js REST API |
| **R** — Frontend | React 18 + React Router v6 |
| **N** — Runtime | Node.js 18+ |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| State | React Context API |
| HTTP client | Axios |
| Charts | Chart.js + react-chartjs-2 |
| Notifications | react-hot-toast |
| Styles | Plain CSS with CSS Custom Properties |

---

## Project Structure

```
moodquest-mern/
├── server/                   ← Express + MongoDB backend
│   ├── config/db.js          ← Mongoose connection
│   ├── middleware/
│   │   └── authMiddleware.js ← JWT protect guard
│   ├── models/
│   │   ├── User.js           ← User schema (bcrypt hashed password)
│   │   ├── MoodLog.js        ← Mood entries with 1-5 score
│   │   └── JournalEntry.js   ← Journal with optional mood tag
│   ├── routes/
│   │   ├── auth.js           ← POST /register, POST /login
│   │   ├── users.js          ← Profile, challenges, breathing, leaderboard
│   │   ├── moods.js          ← Log mood, history, weekly averages
│   │   └── journal.js        ← Create, list, delete entries
│   ├── server.js             ← App entry point
│   ├── .env                  ← Environment variables (not committed)
│   └── .env.example          ← Template for .env
│
├── client/                   ← React frontend
│   ├── public/index.html
│   └── src/
│       ├── App.js            ← Routes + auth guard
│       ├── index.css         ← Full design system
│       ├── context/
│       │   └── AuthContext.js ← Global login/register/logout
│       ├── utils/
│       │   ├── api.js        ← Axios instance with JWT interceptor
│       │   └── confetti.js   ← Confetti animation helper
│       ├── components/
│       │   └── Navbar.js     ← Desktop + mobile nav, dark mode toggle
│       └── pages/
│           ├── LoginPage.js  ← Register + login with mode toggle
│           ├── Dashboard.js  ← Stats, mood chart, quote, progress
│           ├── Challenges.js ← 10 challenges with category filters
│           ├── Wellness.js   ← Mood tracker, journal, breathing tabs
│           ├── Achievements.js ← 9 achievement badges
│           └── Leaderboard.js  ← Live MongoDB rankings
│
├── package.json              ← Root scripts (dev, build, install-all)
└── .gitignore
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account (username + password) |
| POST | `/api/auth/login` | Login, returns JWT token |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Get current user profile | ✅ |
| PUT | `/api/users/darkmode` | Save dark mode preference | ✅ |
| POST | `/api/users/challenge` | Complete a challenge, earn points | ✅ |
| POST | `/api/users/breathing` | Record breathing session, earn points | ✅ |
| GET | `/api/users/leaderboard` | Top 15 users by points | ✅ |

### Moods
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/moods` | Log a mood entry, earn +10 pts | ✅ |
| GET | `/api/moods` | Get last 30 mood entries | ✅ |
| GET | `/api/moods/weekly` | Get 7-day mood averages for chart | ✅ |

### Journal
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/journal` | Create entry, earn +15 pts | ✅ |
| GET | `/api/journal` | Get all user entries | ✅ |
| DELETE | `/api/journal/:id` | Delete own entry | ✅ |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone and install
```bash
git clone https://github.com/yourusername/moodquest-mern.git
cd moodquest-mern
npm run install-all
```

### 2. Configure environment
```bash
cd server
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### 3. Run in development
```bash
# From the root folder — starts both server (port 5000) and client (port 3000)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Deployment

### Option A — Render (recommended, free)

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your repo, set:
   - **Build command:** `npm run install-all && npm run build`
   - **Start command:** `npm start`
4. Add environment variables in Render dashboard:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random secret
   - `NODE_ENV` — `production`
5. Deploy — Render builds React and serves it from Express automatically

### Option B — Railway
Same process, just use Railway's dashboard to set env vars and connect the repo.

### Option C — Heroku
```bash
heroku create moodquest-app
heroku config:set MONGO_URI=... JWT_SECRET=... NODE_ENV=production
git push heroku main
```
The `heroku-postbuild` script in `package.json` builds React automatically.

---

## Features

- 🔐 **Real authentication** — bcrypt hashed passwords, JWT sessions (30-day expiry)
- 🎯 **10 daily challenges** with category filters — all saved to MongoDB
- 😊 **Mood tracker** — logged to DB with 1–5 scores, 7-day chart from real aggregated data
- 📓 **Journal** — private entries with mood tags, full CRUD, stored in MongoDB
- 🌬️ **Guided breathing** — box breathing, 4 cycles, points recorded in DB
- 🏆 **9 achievements** — checked server-side on every relevant action
- 📊 **Live leaderboard** — real MongoDB query sorted by points
- 🌙 **Dark mode** — preference saved to DB and synced across devices
- 🔥 **Streak tracking** — checked and updated on every login

---

## Author

**Sana Tasneem Azimudin** — Register Number: 2024503007
