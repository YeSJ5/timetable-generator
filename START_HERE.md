# 🚀 START HERE - Enterprise Timetable Generator

## Quick Setup (2 Commands)

### Option 1: Automated Script
```powershell
.\setup-upgrade.ps1
```

### Option 2: Manual Setup

**Backend:**
```powershell
cd server
npm install
npm run prisma:generate
npm run dev
```

**Frontend (new terminal):**
```powershell
cd client
npm install
npm run dev
```

## ✅ What's Ready

### Core Features ✅
- ✅ AI Timetable Generation with Priority Sliders
- ✅ Teacher Preferences & Availability Matrix
- ✅ Subject Constraints System
- ✅ Section Workload Rules
- ✅ Room Allocation Rules
- ✅ Version History & Rollback
- ✅ View All Timetables with ZIP Export
- ✅ Analytics Dashboard
- ✅ PDF/CSV Export

### Backend ✅
- ✅ All API endpoints implemented
- ✅ Database schema with all models
- ✅ AI engine with priorities
- ✅ Version management system
- ✅ Conflict detection

### Frontend ✅
- ✅ All pages and components
- ✅ Priority settings UI
- ✅ Preferences panels
- ✅ Timetable viewer
- ✅ Analytics charts

## 🎯 First Steps After Setup

1. **Start Servers**
   - Backend: `cd server && npm run dev` (port 5000)
   - Frontend: `cd client && npm run dev` (port 3000)

2. **Add Data**
   - Go to "Manage Data"
   - Add Teachers, Subjects, Sections, Rooms
   - Create Teacher-Subject-Section Mappings
   - Add Labs (optional)

3. **Set Preferences** (Optional)
   - Click on a teacher → Set availability matrix
   - Configure subject constraints
   - Set section workload rules

4. **Generate Timetable**
   - Go to "Generate" page
   - Select sections
   - Adjust priority sliders
   - Choose generation mode (Strict/Adaptive/Free)
   - Click "Generate"

5. **View Results**
   - "View Timetable" - Single section view
   - "All Timetables" - All sections with ZIP export
   - "Analytics" - Charts and insights

## 📚 Documentation

- `QUICK_START.md` - Detailed setup guide
- `SETUP_COMPLETE.md` - Setup verification
- `UPGRADE_CHECKLIST.md` - Feature checklist
- `UPGRADE_SUMMARY.md` - Complete feature list

## 🔧 Troubleshooting

### Prisma Generate Fails
```powershell
Get-Process node | Stop-Process -Force
cd server
npm run prisma:generate
```

### Port Already in Use
- Backend: Change port in `server/src/server.ts`
- Frontend: Change port in `client/vite.config.ts`

### Database Issues
```powershell
cd server
npx prisma migrate reset  # ⚠️ Deletes all data
npx prisma migrate dev
```

## 🎉 You're All Set!

The enterprise upgrade is complete and ready to use. All infrastructure is in place.

**Happy Scheduling!** 📅


