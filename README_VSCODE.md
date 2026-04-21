# Running CropCycle in VS Code

## Project Structure (what to open)

```
crop-cycle-app/
├── backend/          ← Node.js + Express API
├── frontend/         ← React + Vite app  (npm run dev)
├── standalone/
│   └── demo.html     ← Open this directly in browser (no setup needed)
└── README_VSCODE.md  ← This file
```

---

## Option A — Instant Preview (No Setup)

Just open `standalone/demo.html` in your browser.  
Double-click it, or right-click → Open With → Browser.  
Uses real authentication against your backend if it's running,  
OR click **"View Demo (skip login)"** to run entirely offline.

---

## Option B — Full Stack in VS Code

### Step 1 — Install requirements

| Tool | Download |
|------|----------|
| Node.js v18+ | https://nodejs.org |
| MongoDB Community | https://www.mongodb.com/try/download/community |
| VS Code | https://code.visualstudio.com |

> **Easier alternative to local MongoDB:** Use [MongoDB Atlas](https://cloud.mongodb.com) free tier — create a cluster, get a connection string, done.

---

### Step 2 — Open the project

```
File → Open Folder → select crop-cycle-app/
```

---

### Step 3 — Install VS Code extensions (recommended)

Open Extensions panel (`Ctrl+Shift+X`) and install:

- **ESLint** — code linting
- **Prettier** — auto format
- **ES7+ React/Redux Snippets** — React shortcuts  
- **Thunder Client** — test API like Postman, built into VS Code
- **MongoDB for VS Code** — browse your database visually

---

### Step 4 — Set up the Backend

Open a terminal (`Ctrl+`` ` ``):

```bash
cd backend
npm install
```

Create `.env` from the example:
```bash
# Windows:
copy .env.example .env

# Mac/Linux:
cp .env.example .env
```

Open `.env` in VS Code and fill it in:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crop_cycle_db
JWT_SECRET=pick_any_long_random_string_here_minimum_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

✅ You should see:
```
🌱 Crop Cycle Server running on port 5000
✅ MongoDB Connected: localhost
```

---

### Step 5 — Set up the Frontend

Click the **+** icon in the terminal panel to open a second terminal:

```bash
cd frontend
npm install
```

Create the frontend `.env`:
```bash
# Windows:
copy .env.example .env

# Mac/Linux:
cp .env.example .env
```

The frontend `.env` should contain:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

✅ You should see:
```
  VITE v5.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

---

### Step 6 — Use the app

Open **http://localhost:5173** in your browser.

1. Click **"Create one"** to register a new account
2. Enter your name, email, and a password (min 6 characters)
3. You'll be redirected to the dashboard
4. Go to **New Analysis** → load a demo dataset or upload a CSV
5. View the analysis results with NDVI chart and stage detection

---

## Authentication — How It Works

The app uses **real JWT authentication**:

| Action | What happens |
|--------|-------------|
| Register | Password is hashed with bcrypt (10 rounds), stored in MongoDB, JWT returned |
| Login | Password compared with bcrypt hash — wrong password = 401 error |
| Protected routes | Every API call sends `Authorization: Bearer <token>` header |
| Token expiry | JWT expires in 7 days — then you must log in again |
| Invalid token | Automatically redirected to login page |

**Wrong password behavior:** The backend returns `401 Invalid credentials` — the UI shows a red error message. You cannot proceed without correct credentials.

---

## Test the API with Thunder Client

Install Thunder Client extension, then test these endpoints:

**Register:**
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "test@example.com",
  "password": "wrongpassword"
}
→ Returns: 401 { "success": false, "message": "Invalid credentials" }
```

**Load demo data (requires token from login):**
```
POST http://localhost:5000/api/data/demo
Headers: Authorization: Bearer <your_token>
Body (JSON): { "demoKey": "wheat_india" }
```

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Cannot find module 'express'` | Run `npm install` inside `backend/` folder |
| `MongoServerError: connect ECONNREFUSED` | Start MongoDB: run `mongod` in a new terminal |
| `Port 5000 already in use` | Change `PORT=5001` in `backend/.env` |
| `CORS error` in browser | Make sure `FRONTEND_URL=http://localhost:5173` in `backend/.env` |
| White screen on frontend | Check browser console — usually a missing `.env` file |
| `npm run dev` not found | Make sure you're inside the `frontend/` folder, not the root |
| Login accepts anything | You're opening `standalone/demo.html` — use `npm run dev` instead |

---

## Two-terminal VS Code layout

```
┌─────────────────────────────────────────────┐
│  VS Code Editor                             │
├──────────────────┬──────────────────────────┤
│  Terminal 1      │  Terminal 2              │
│  cd backend      │  cd frontend             │
│  npm run dev     │  npm run dev             │
│                  │                          │
│  🌱 Running      │  ➜ Local: :5173          │
│  on port 5000    │                          │
└──────────────────┴──────────────────────────┘
```

Use **View → Editor Layout → Split Terminal** or click the split icon (⊞) in the terminal panel.

---

## Build for Production

```bash
# Frontend — creates dist/ folder
cd frontend
npm run build

# Backend — just use npm start (no build needed for Node.js)
cd backend
npm start
```

Deploy `frontend/dist/` to **Vercel**, backend to **Render.com** (see `backend/render.yaml`).
