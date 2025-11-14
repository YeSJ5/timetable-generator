# ✅ Deployment Checklist

Use this checklist to ensure successful deployment.

## Pre-Deployment

### Backend
- [ ] `Dockerfile` exists and is production-ready
- [ ] `package.json` has `start` script
- [ ] Prisma schema uses `env("DATABASE_URL")`
- [ ] Server handles `PORT` from environment
- [ ] Server binds to `0.0.0.0` (not just `localhost`)
- [ ] Health endpoint exists (`/health`)
- [ ] CORS configured for production
- [ ] Error handling middleware in place
- [ ] Logging configured for production

### Frontend
- [ ] `next.config.ts` configured
- [ ] `NEXT_PUBLIC_API_URL` used in API client
- [ ] All imports use `@/` alias
- [ ] No server-only code in client components
- [ ] Build succeeds locally (`npm run build`)
- [ ] TypeScript compiles without errors
- [ ] All shadcn/ui components installed

## Railway (Backend) Deployment

### Setup
- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] Project created with root directory `server`
- [ ] Environment variables added:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
  - [ ] `DATABASE_URL=file:./data/prod.db`
  - [ ] `CORS_ORIGIN=https://your-frontend.vercel.app`
  - [ ] `USE_GREEDY_SOLVER=true`

### Build & Deploy
- [ ] Build command detected/configured
- [ ] Start command detected/configured
- [ ] Dockerfile detected
- [ ] First deployment successful
- [ ] No build errors in logs

### Database
- [ ] Migrations run (`npx prisma migrate deploy`)
- [ ] Database file created in `/app/data`
- [ ] No permission errors

### Verification
- [ ] Health endpoint responds: `GET /health`
- [ ] API endpoints accessible
- [ ] CORS allows frontend domain
- [ ] Logs show no errors
- [ ] Backend URL obtained and saved

## Vercel (Frontend) Deployment

### Setup
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project imported
- [ ] **Root Directory set to `server/frontend`**
- [ ] Framework preset: Next.js

### Configuration
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Install command: `npm ci`
- [ ] Environment variable added:
  - [ ] `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`

### Deploy
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] No build warnings
- [ ] Deployment URL obtained

### Post-Deploy
- [ ] Backend `CORS_ORIGIN` updated with frontend URL
- [ ] Backend redeployed (if needed)

## Integration Testing

### Backend Health
- [ ] `curl https://your-backend.railway.app/health` returns 200
- [ ] Response includes `{"status":"ok"}`

### Frontend Health
- [ ] Frontend loads without errors
- [ ] Browser console shows no errors
- [ ] Network tab shows API calls

### API Communication
- [ ] Frontend → Backend API calls succeed
- [ ] CORS headers present in responses
- [ ] No CORS errors in browser console

### Feature Testing
- [ ] Home page loads (`/`)
- [ ] Timetable page loads (`/timetable/[sectionId]`)
- [ ] Admin dashboard loads (`/admin/dashboard`)
- [ ] Analytics page loads (`/admin/analytics`)
- [ ] Versions page loads (`/admin/versions`)
- [ ] Debug page loads (`/debug`)

### Critical Endpoints
- [ ] `GET /health` - Health check
- [ ] `GET /timetable/:sectionId/snapshot` - Timetable data
- [ ] `GET /timetable/:sectionId/versions` - Version history
- [ ] `POST /regenerate/teacher` - Regeneration
- [ ] `GET /versions/:v1/compare/:v2` - Version comparison
- [ ] `GET /debug/performance` - Debug tools

## Production Readiness

### Security
- [ ] Helmet middleware enabled (production only)
- [ ] CORS restricted to frontend domain
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] No sensitive data in logs

### Performance
- [ ] Compression enabled
- [ ] Database queries optimized
- [ ] Frontend lazy-loading working
- [ ] Images optimized (if any)

### Monitoring
- [ ] Railway logs accessible
- [ ] Vercel logs accessible
- [ ] Error tracking configured (optional)
- [ ] Uptime monitoring (optional)

### Documentation
- [ ] Deployment guide complete
- [ ] Environment variables documented
- [ ] Troubleshooting guide available
- [ ] API documentation accessible (`/openapi.json`)

## Post-Deployment

### Immediate (First 24 hours)
- [ ] Monitor logs for errors
- [ ] Test all critical features
- [ ] Verify database persistence
- [ ] Check API response times

### Short-term (First week)
- [ ] Monitor uptime
- [ ] Check error rates
- [ ] Verify data integrity
- [ ] Test regeneration features
- [ ] Test version comparison

### Long-term
- [ ] Set up automated backups (if using SQLite)
- [ ] Consider PostgreSQL migration (for scale)
- [ ] Set up monitoring/alerting
- [ ] Document any issues encountered

## Rollback Plan

If deployment fails:

### Backend
1. Check Railway logs
2. Verify environment variables
3. Test locally with production env vars
4. Rollback to previous deployment if needed

### Frontend
1. Check Vercel build logs
2. Fix build errors locally
3. Redeploy
4. Rollback to previous deployment if needed

## Support Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Project Deployment Guide:** `server/DEPLOYMENT.md`
- **Quick Start:** `DEPLOYMENT_QUICK_START.md`

---

**Deployment Status:** ☐ Not Started | ☐ In Progress | ☐ Complete

**Date Completed:** ___________

**Deployed URLs:**
- Backend: `https://________________.railway.app`
- Frontend: `https://________________.vercel.app`

