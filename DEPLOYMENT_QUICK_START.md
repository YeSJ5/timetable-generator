# 🚀 Quick Deployment Guide

Copy-paste deployment instructions for Railway (Backend) and Vercel (Frontend).

---

## 📦 Backend Deployment (Railway)

### Step 1: Create Railway Project

1. Go to https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Select your repository
3. **Root Directory:** `server`

### Step 2: Add Environment Variables

In Railway → Your Service → **Variables**, add:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./data/prod.db
CORS_ORIGIN=https://your-frontend.vercel.app
USE_GREEDY_SOLVER=true
```

### Step 3: Railway Auto-Detects

Railway will automatically detect:
- **Build Command:** `npm ci && npx prisma generate && npm run build`
- **Start Command:** `npm start`
- **Dockerfile:** Uses existing `Dockerfile`

### Step 4: Run Migrations

After first deployment:

1. Railway Dashboard → Your Service → **Deployments** → Latest
2. Click **"Shell"** tab
3. Run:
   ```bash
   npx prisma migrate deploy
   ```

### Step 5: Get Your Backend URL

Railway provides a URL like: `https://your-app.railway.app`

**Save this URL** - you'll need it for frontend!

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Import to Vercel

1. Go to https://vercel.com → **Add New Project**
2. Import your GitHub repository
3. **IMPORTANT:** Set **Root Directory** to `server/frontend`

### Step 2: Configure Build

**Framework Preset:** Next.js (auto-detected)

**Build Settings:**
- **Root Directory:** `server/frontend`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm ci` (auto-detected)

### Step 3: Add Environment Variable

In Vercel → Project Settings → **Environment Variables**, add:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Replace `your-backend.railway.app` with your actual Railway URL!**

### Step 4: Deploy

Click **"Deploy"** and wait for build to complete.

### Step 5: Update Backend CORS

After frontend deploys, update Railway environment variable:

```bash
CORS_ORIGIN=https://your-frontend.vercel.app
```

Railway will auto-redeploy.

---

## ✅ Verification

### Backend Health Check

```bash
curl https://your-backend.railway.app/health
```

Expected: `{"status":"ok",...}`

### Frontend Check

1. Visit your Vercel URL
2. Open DevTools → Console (should be no errors)
3. Navigate to `/timetable/test-section`
4. Check Network tab - API calls should succeed

---

## 🔧 Troubleshooting

### Backend Issues

**Port not working?**
- Railway provides `PORT` automatically
- Server uses `process.env.PORT || 3000`

**Database not persisting?**
- SQLite uses `file:./data/prod.db`
- Railway provides persistent storage

**Migrations failing?**
- Run: `npx prisma migrate deploy` in Railway Shell
- Check `DATABASE_URL` is correct

### Frontend Issues

**Build failing?**
- Ensure Root Directory is `server/frontend`
- Check all imports use `@/` alias

**API not connecting?**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend CORS includes frontend URL
- Test backend directly: `curl https://your-backend.railway.app/health`

**Missing UI components?**
```bash
cd server/frontend
npx shadcn@latest add button card badge
```

---

## 📋 Environment Variables Summary

### Railway (Backend)
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./data/prod.db
CORS_ORIGIN=https://your-frontend.vercel.app
USE_GREEDY_SOLVER=true
```

### Vercel (Frontend)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## 🎉 Done!

Your app is live:
- **Backend:** `https://your-backend.railway.app`
- **Frontend:** `https://your-frontend.vercel.app`

For detailed instructions, see `server/DEPLOYMENT.md`

