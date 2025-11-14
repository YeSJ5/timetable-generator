# 🚀 Quick Start Guide - Enterprise Upgrade

## One-Command Setup (PowerShell)

```powershell
.\setup-upgrade.ps1
```

This script will:
- ✅ Check Node.js installation
- ✅ Stop any running processes
- ✅ Install all dependencies (server + client)
- ✅ Generate Prisma Client
- ✅ Run database migrations

## Manual Setup

### 1. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run migrations (if needed)
npm run prisma:migrate

# Start server
npm run dev
```

### 2. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start dev server
npm run dev
```

## ⚠️ Troubleshooting

### Prisma Generate Fails (EPERM Error)

**Solution:** Stop all Node.js processes first

```powershell
# Stop Node processes
Get-Process node | Stop-Process -Force

# Then retry
cd server
npm run prisma:generate
```

### Database Migration Issues

If migration fails, you can reset (⚠️ **WARNING: Deletes all data**):

```bash
cd server
rm prisma/dev.db
npm run prisma:migrate
```

### Port Already in Use

- **Backend (5000)**: Change in `server/src/server.ts`
- **Frontend (3000)**: Change in `client/vite.config.ts`

## 📋 Verification Checklist

After setup, verify:

- [ ] Backend starts without errors (`npm run dev` in server/)
- [ ] Frontend starts without errors (`npm run dev` in client/)
- [ ] Can access `http://localhost:3000`
- [ ] Can access `http://localhost:5000/health` (should return `{"status":"ok"}`)
- [ ] Database file exists at `server/prisma/dev.db`

## 🎯 First Steps

1. **Add Data**: Go to "Manage Data" and add:
   - Teachers
   - Subjects
   - Sections
   - Rooms
   - Mappings
   - Labs

2. **Set Preferences**: 
   - Click "Preferences" on teachers to set availability matrix
   - Configure subject constraints
   - Set section workload rules

3. **Generate Timetable**:
   - Go to "Generate" page
   - Adjust priority sliders
   - Select generation mode
   - Generate!

4. **View Results**:
   - Check "View Timetable" for single section
   - Check "All Timetables" for all sections
   - Export as PDF or ZIP

## 🔧 Environment Variables (Optional)

Create `server/.env`:

```env
OPENAI_API_KEY=your_key_here
PORT=5000
```

## 📚 Documentation

- `UPGRADE_SUMMARY.md` - Complete feature list
- `MIGRATION_GUIDE.md` - Detailed migration steps
- `FILES_MODIFIED.md` - List of all changed files
- `ENTERPRISE_UPGRADE_COMPLETE.md` - Implementation status
