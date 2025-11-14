# 🚀 Deployment Summary

Quick reference for deploying the AI Timetable Generator.

## 📦 Backend (Railway)

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./data/prod.db
CORS_ORIGIN=https://your-frontend.vercel.app
USE_GREEDY_SOLVER=true
```

### Build/Start Commands (Auto-detected)
- **Build:** `npm ci && npx prisma generate && npm run build`
- **Start:** `npm start`
- **Root Directory:** `server`

### Post-Deploy
```bash
npx prisma migrate deploy
```

---

## 🎨 Frontend (Vercel)

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Build Settings
- **Root Directory:** `server/frontend`
- **Framework:** Next.js
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)

---

## ✅ Verification

### Backend
```bash
curl https://your-backend.railway.app/health
```

### Frontend
1. Visit: `https://your-frontend.vercel.app`
2. Check browser console (no errors)
3. Test API connection

---

## 📚 Full Guides

- **Quick Start:** `DEPLOYMENT_QUICK_START.md`
- **Detailed Guide:** `server/DEPLOYMENT.md`
- **Checklist:** `DEPLOYMENT_CHECKLIST.md`

