# ✅ Enterprise Upgrade Checklist

## Pre-Upgrade Verification

- [x] Prisma schema updated with all new models
- [x] Backend dependencies added (openai, seedrandom, multer, csv-parse, archiver)
- [x] Frontend dependencies added (recharts, react-hot-toast, papaparse, react-dnd, jszip)
- [x] All new files created
- [x] Routes updated
- [x] Engine enhanced with priorities and modes

## Setup Steps

### 1. Database Migration ✅
```bash
cd server
npm run prisma:migrate --name enterprise_upgrade
npm run prisma:generate
```

### 2. Install Dependencies ✅
```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### 3. Verify Installation ✅
- [ ] Backend compiles without errors
- [ ] Frontend compiles without errors
- [ ] Prisma client generated successfully
- [ ] Database migrations applied

## Post-Setup Testing

### Backend API Tests
- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] `GET /teachers` returns list
- [ ] `GET /preferences/teacher/:id` works
- [ ] `POST /timetable/generate` accepts priorities and mode
- [ ] `GET /timetable/:sectionId/versions` returns versions

### Frontend Tests
- [ ] App loads at `http://localhost:3000`
- [ ] Navigation works
- [ ] Generate page shows priority sliders
- [ ] Teacher preferences panel opens
- [ ] View all timetables page loads

### Feature Tests
- [ ] Can set teacher availability matrix
- [ ] Can adjust priority sliders
- [ ] Can select generation mode
- [ ] Can generate timetable with priorities
- [ ] Version history is created
- [ ] Can view all timetables
- [ ] ZIP export works

## Known Issues & Solutions

### Issue: Prisma Generate EPERM Error
**Solution:** Stop Node processes before generating
```powershell
Get-Process node | Stop-Process -Force
cd server
npm run prisma:generate
```

### Issue: Database Migration Fails
**Solution:** Check if schema is already applied
```bash
cd server
npx prisma migrate status
```

### Issue: TypeScript Errors
**Solution:** Regenerate Prisma client
```bash
cd server
npm run prisma:generate
```

## Environment Setup

### Required
- Node.js 18+
- npm or yarn

### Optional
- OpenAI API key (for AI Inspector)
  - Create `server/.env` with `OPENAI_API_KEY=your_key`

## Next Steps After Setup

1. **Add Sample Data**
   - Create 2-3 teachers
   - Create 3-5 subjects
   - Create 1-2 sections
   - Create rooms (lecture + lab)
   - Create mappings
   - Add labs (optional)

2. **Test Generation**
   - Go to Generate page
   - Select sections
   - Adjust priorities
   - Generate timetable

3. **Verify Features**
   - Check version history
   - Test preferences
   - View analytics
   - Export timetables

## Support

If you encounter issues:
1. Check `QUICK_START.md` for troubleshooting
2. Verify all dependencies installed
3. Check console for errors
4. Ensure database migrations ran


