# Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The backend will start on `http://localhost:5000`

### 2. Frontend Setup

In a new terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

## First Steps

1. Open `http://localhost:3000` in your browser
2. Go to "Manage Data" tab
3. Add some sample data:
   - **Teachers**: Add at least 2-3 teachers
   - **Subjects**: Add subjects with hours per week (e.g., 3, 4, 5)
   - **Sections**: Add at least one section (e.g., "ISE-A", "ISE-B")
   - **Rooms**: Add lecture rooms and lab rooms
   - **Mappings**: Create teacher-subject-section mappings
   - **Labs** (optional): Add labs if needed

4. Go to "Generate" tab
5. Select a section and click "Generate Timetable"
6. Go to "View Timetable" to see the result

## Database Location

The SQLite database will be created at: `server/prisma/dev.db`

You can view/edit data using Prisma Studio:
```bash
cd server
npm run prisma:studio
```

## Troubleshooting

### Prisma Client Not Found
If you get errors about Prisma Client, run:
```bash
cd server
npm run prisma:generate
```

### Port Already in Use
- Backend: Change port in `server/src/server.ts` (default: 5000)
- Frontend: Change port in `client/vite.config.ts` (default: 3000)

### CORS Errors
Make sure the backend is running before starting the frontend.

