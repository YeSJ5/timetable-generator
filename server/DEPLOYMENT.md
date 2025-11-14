# Deployment Guide

Complete deployment instructions for Railway (Backend) and Vercel (Frontend).

## 🚀 Backend Deployment (Railway)

### Prerequisites

1. Railway account: https://railway.app
2. GitHub repository connected to Railway
3. SQLite database (or PostgreSQL for production)

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Select the **`server`** directory as the root

### Step 2: Configure Environment Variables

In Railway dashboard, go to your service → **Variables** tab, and add:

```bash
# Required
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./data/prod.db

# Optional (with defaults)
CORS_ORIGIN=https://your-frontend.vercel.app
USE_GREEDY_SOLVER=true
```

**Important Notes:**
- Railway will auto-detect `PORT` from the environment
- For SQLite, use `file:./data/prod.db` (Railway provides persistent storage)
- For PostgreSQL, Railway can provision a database automatically

### Step 3: Railway Build Settings

Railway will auto-detect these settings:

**Build Command:**
```bash
npm ci && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm start
```

**Root Directory:**
```
server
```

### Step 4: Database Migration

After first deployment, run migrations:

1. Go to Railway dashboard → Your service
2. Click **"Deployments"** → Latest deployment
3. Click **"View Logs"**
4. Open **"Shell"** tab
5. Run:

```bash
npx prisma migrate deploy
```

Or add as a post-deploy script in Railway:

**Post-Deploy Command (optional):**
```bash
npx prisma migrate deploy || true
```

### Step 5: Verify Deployment

1. Check health endpoint:
   ```bash
   curl https://your-app.railway.app/health
   ```

2. Expected response:
   ```json
   {
     "status": "ok",
     "uptime": 123.45,
     "environment": "production"
   }
   ```

### Troubleshooting

#### SQLite on Railway

**Issue:** SQLite database not persisting

**Solution:**
- Ensure `DATABASE_URL=file:./data/prod.db`
- Railway provides persistent storage in `/app/data`
- The Dockerfile already handles this correctly

**Issue:** Permission errors with SQLite

**Solution:**
- Railway runs as non-root user (already configured in Dockerfile)
- Ensure data directory is writable:
  ```bash
  mkdir -p /app/data
  chmod 755 /app/data
  ```

#### Prisma Migration Issues

**Issue:** `prisma migrate deploy` fails

**Solution:**
1. Check DATABASE_URL is correct
2. Ensure Prisma client is generated:
   ```bash
   npx prisma generate
   ```
3. Check migration files exist in `prisma/migrations/`

#### Port Issues

**Issue:** Service not starting

**Solution:**
- Railway provides `PORT` via `$PORT` environment variable
- The server already handles this: `process.env.PORT || 3000`
- Ensure `PORT` is set in Railway variables

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Health endpoint responding (`/health`)
- [ ] CORS configured for frontend domain
- [ ] Logs show no errors
- [ ] API endpoints accessible

---

## 🎨 Frontend Deployment (Vercel)

### Prerequisites

1. Vercel account: https://vercel.com
2. GitHub repository connected to Vercel
3. Backend URL from Railway deployment

### Step 1: Import Project to Vercel

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository
4. **Important:** Set **Root Directory** to `server/frontend`

### Step 2: Configure Build Settings

**Framework Preset:** Next.js

**Root Directory:**
```
server/frontend
```

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm ci
```

### Step 3: Environment Variables

In Vercel dashboard → Project Settings → Environment Variables, add:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Important:**
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Replace `your-backend.railway.app` with your actual Railway URL
- Add for all environments (Production, Preview, Development)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Vercel will provide a URL (e.g., `your-app.vercel.app`)

### Step 5: Update Backend CORS

After frontend is deployed, update Railway environment variable:

```bash
CORS_ORIGIN=https://your-app.vercel.app
```

Then redeploy backend (Railway auto-redeploys on env var changes).

### Step 6: Verify Deployment

1. Visit your Vercel URL
2. Check browser console for errors
3. Test API connection:
   - Open DevTools → Network tab
   - Navigate to `/timetable/[sectionId]`
   - Verify API calls succeed

### Troubleshooting

#### Build Failures

**Issue:** `Module not found` errors

**Solution:**
- Ensure Root Directory is set to `server/frontend`
- Check all imports use `@/` alias (configured in `tsconfig.json`)

**Issue:** TypeScript errors

**Solution:**
- Run `npm run build` locally first
- Fix any type errors before deploying

#### API Connection Issues

**Issue:** CORS errors

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify backend `CORS_ORIGIN` includes frontend URL
3. Check browser console for exact error

**Issue:** API calls failing

**Solution:**
1. Verify backend is running (check `/health` endpoint)
2. Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
3. Test API directly: `curl https://your-backend.railway.app/health`

#### Missing shadcn/ui Components

**Issue:** Build fails with missing UI components

**Solution:**
```bash
cd server/frontend
npx shadcn@latest add button card badge
```

Then commit and redeploy.

### Production Checklist

- [ ] Root directory set to `server/frontend`
- [ ] `NEXT_PUBLIC_API_URL` configured
- [ ] Build succeeds without errors
- [ ] Frontend loads correctly
- [ ] API calls work (check Network tab)
- [ ] No console errors
- [ ] All pages accessible:
  - `/` (Home)
  - `/timetable/[sectionId]`
  - `/admin/dashboard`
  - `/admin/analytics`
  - `/admin/versions`
  - `/debug`

---

## 🔗 Post-Deployment Verification

### Backend Health Check

```bash
# Health endpoint
curl https://your-backend.railway.app/health

# Expected: {"status":"ok","uptime":...,"environment":"production"}
```

### Frontend Health Check

1. Visit: `https://your-frontend.vercel.app`
2. Open DevTools → Console
3. Should see no errors
4. Navigate to `/timetable/test-section`
5. Check Network tab for API calls

### Integration Test

1. **Backend API:**
   ```bash
   curl https://your-backend.railway.app/timetable/test-section/snapshot
   ```

2. **Frontend → Backend:**
   - Open frontend in browser
   - Navigate to `/timetable/test-section`
   - Verify timetable loads (or shows empty state)

3. **Regeneration:**
   - Click "Regenerate Teacher"
   - Verify API call succeeds
   - Check backend logs for errors

### Endpoint Verification

Test these critical endpoints:

```bash
# Health
curl https://your-backend.railway.app/health

# Timetable snapshot
curl https://your-backend.railway.app/timetable/test-section/snapshot

# Versions
curl https://your-backend.railway.app/timetable/test-section/versions

# Debug (if enabled)
curl https://your-backend.railway.app/debug/performance
```

---

## 📝 Quick Reference

### Railway Environment Variables

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./data/prod.db
CORS_ORIGIN=https://your-frontend.vercel.app
USE_GREEDY_SOLVER=true
```

### Vercel Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Railway Build/Start Commands

**Build:**
```bash
npm ci && npx prisma generate && npm run build
```

**Start:**
```bash
npm start
```

**Post-Deploy (optional):**
```bash
npx prisma migrate deploy || true
```

### Vercel Build Settings

- **Root Directory:** `server/frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm ci`

---

## 🆘 Support

If you encounter issues:

1. **Check Logs:**
   - Railway: Dashboard → Service → Logs
   - Vercel: Dashboard → Deployment → Logs

2. **Verify Environment Variables:**
   - Railway: Service → Variables
   - Vercel: Project Settings → Environment Variables

3. **Test Locally:**
   - Backend: `npm run dev` (with production env vars)
   - Frontend: `npm run dev` (with `NEXT_PUBLIC_API_URL`)

4. **Common Issues:**
   - See Troubleshooting sections above
   - Check GitHub Issues
   - Review deployment logs

---

## ✅ Deployment Checklist

### Backend (Railway)
- [ ] Project created and connected to GitHub
- [ ] Root directory set to `server`
- [ ] Environment variables configured
- [ ] Build command works
- [ ] Start command works
- [ ] Database migrations run
- [ ] Health endpoint responds
- [ ] CORS configured
- [ ] Logs show no errors

### Frontend (Vercel)
- [ ] Project imported from GitHub
- [ ] Root directory set to `server/frontend`
- [ ] `NEXT_PUBLIC_API_URL` configured
- [ ] Build succeeds
- [ ] Frontend loads correctly
- [ ] API calls work
- [ ] No console errors
- [ ] All pages accessible

### Integration
- [ ] Frontend → Backend communication works
- [ ] CORS allows frontend domain
- [ ] Regeneration endpoints accessible
- [ ] Version endpoints accessible
- [ ] Debug endpoints accessible (if enabled)
- [ ] All UI features functional

---

**Deployment Complete! 🎉**

Your AI Timetable Generator is now live on:
- **Backend:** `https://your-backend.railway.app`
- **Frontend:** `https://your-frontend.vercel.app`

