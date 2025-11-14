# Enterprise Upgrade Migration Guide

## 🚀 Quick Start

### Step 1: Database Migration

```bash
cd server
npm run prisma:migrate --name enterprise_upgrade
npm run prisma:generate
```

This will:
- Add new fields to Teacher, Subject, Section, Room models
- Create TimetableVersion model
- Update Timetable model with version tracking

### Step 2: Install Dependencies

```bash
# Server
cd server
npm install

# Client  
cd client
npm install
```

### Step 3: Start Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## 📋 What's New

### 1. Teacher Preferences System ✅
- **Availability Matrix**: Click on any teacher in Manage Data → Preferences button
- **Settings**: Max classes per day/week, gap preferences, consecutive preferences
- **API**: `GET/PUT /preferences/teacher/:id`

### 2. Priority-Based Generation ✅
- **6 Priority Sliders**: Adjust on Generate page
- **3 Modes**: Strict / Adaptive / Free
- **Dynamic Scoring**: Engine respects your priorities

### 3. Enhanced Constraints ✅
- **Subject Constraints**: Spread across week, no consecutive days
- **Section Rules**: Max hours/day, max back-to-back, minimum breaks
- **Room Rules**: Capacity, equipment, availability

### 4. View All Timetables ✅
- **New Route**: `/view-all`
- **ZIP Export**: Export all timetables at once

## 🔧 API Changes

### Generation Endpoint
```typescript
POST /timetable/generate
{
  sections: string[] | "all",
  candidateCount?: number,
  generationMode?: "strict" | "adaptive" | "free",
  priorities?: {
    teacherPriority: number,
    roomUtilization: number,
    studentWorkloadBalance: number,
    subjectSpreadQuality: number,
    labPlacementImportance: number,
    conflictAvoidanceStrictness: number
  }
}
```

### Preferences Endpoints
```
GET /preferences/teacher/:id
PUT /preferences/teacher/:id
GET /preferences/subject/:id
PUT /preferences/subject/:id
GET /preferences/section/:id
PUT /preferences/section/:id
GET /preferences/room/:id
PUT /preferences/room/:id
```

## 📁 New Files Created

### Backend
- `server/src/types/preferences.ts` - Type definitions
- `server/src/routes/preferences.ts` - Preferences API routes

### Frontend
- `client/src/components/TeacherPreferencesPanel.tsx` - Availability matrix editor
- `client/src/pages/PrioritySettings.tsx` - Priority sliders component
- `client/src/pages/ViewAllTimetables.tsx` - All timetables view

## ⚠️ Breaking Changes

None! All changes are backward compatible:
- Default priorities are 50% for all
- Default mode is "adaptive"
- Old timetables still work
- API defaults provided for missing fields

## 🎯 Usage Examples

### Set Teacher Preferences
1. Go to Manage Data → Teachers
2. Click "Preferences" button on any teacher
3. Click cells in availability matrix to cycle: Available → Preferred → Not Available → No Labs
4. Set max classes and preferences
5. Save

### Generate with Priorities
1. Go to Generate page
2. Adjust priority sliders (0-100%)
3. Select generation mode
4. Select sections
5. Generate

### View All Timetables
1. Go to "All Timetables" in navigation
2. View all sections
3. Click "Export All as ZIP" to download

## 🐛 Troubleshooting

### Migration Fails
```bash
# Reset database (WARNING: Deletes all data)
cd server
rm prisma/dev.db
npm run prisma:migrate
```

### Type Errors
```bash
# Regenerate Prisma client
cd server
npm run prisma:generate
```

### Missing Dependencies
```bash
# Both server and client
npm install
```

## 📚 Next Steps (Future Enhancements)

1. Drag-and-drop editor (react-dnd installed, ready to implement)
2. Version history UI (backend ready, need frontend)
3. Enhanced analytics charts
4. Professional UI redesign
5. Section-wise mappings restructure

## ✅ Verification Checklist

- [ ] Database migration successful
- [ ] Prisma client regenerated
- [ ] All dependencies installed
- [ ] Server starts without errors
- [ ] Client starts without errors
- [ ] Can access Generate page with priority sliders
- [ ] Can access Teacher Preferences panel
- [ ] Can view all timetables page
- [ ] Generation works with new priorities

## 📞 Support

If you encounter issues:
1. Check `UPGRADE_SUMMARY.md` for feature list
2. Verify all migrations ran successfully
3. Check console for TypeScript errors
4. Ensure all dependencies are installed

