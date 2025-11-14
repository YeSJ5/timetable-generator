# AI Timetable Generator - Premium Edition

A full-stack, production-ready academic timetable generation system with AI-powered analysis, multi-section scheduling, and comprehensive management features.

## 🚀 Features

### Core Functionality
- **Multi-Section Scheduling**: Generate timetables for multiple sections simultaneously with cross-section conflict avoidance
- **AI-Powered Engine**: Generates multiple candidates, scores them, and selects the best one
- **Lab Support**: Handles multi-slot lab sessions with proper column spanning
- **Teacher Preferences**: Respects morning/afternoon preferences and time slot preferences
- **Conflict Detection**: Prevents teacher, room, and subject conflicts across all sections

### Premium Features
- **AI Inspector** (Optional): OpenAI-powered analysis and suggestions for timetable improvements
- **Bulk CSV Import**: Import teachers, subjects, rooms, sections, and labs via CSV
- **Setup Wizard**: Guided setup process for initial configuration
- **Analytics Dashboard**: Visual analytics with charts (teacher workload, room utilization, etc.)
- **Premium PDF Export**: High-quality PDF export matching college print format
- **Settings Management**: Configure time slots, breaks, and engine parameters
- **Responsive UI**: Modern, polished interface with Tailwind CSS

## 📋 Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with Prisma ORM
- **State Management**: React Query
- **Charts**: Recharts
- **PDF Export**: html2canvas + jsPDF
- **AI**: OpenAI API (optional, server-side only)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- (Optional) OpenAI API key for AI Inspector feature

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up Prisma:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. (Optional) Configure OpenAI API key:
   - Create a `.env` file in the `server` directory
   - Add: `OPENAI_API_KEY=your_key_here`
   - **Never commit this file to version control**

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📖 Usage Guide

### Initial Setup

1. **Use Setup Wizard** (Recommended for first-time setup):
   - Go to Dashboard
   - Use the setup wizard to import data via CSV
   - Follow the guided steps: Teachers → Subjects → Rooms → Sections → Mappings → Labs

2. **Manual Setup**:
   - Go to "Manage Data" tab
   - Add Teachers, Subjects, Sections, Rooms
   - Create Teacher-Subject-Section Mappings
   - Add Labs (if needed)

### Generating Timetables

1. Go to "Generate" page
2. Select sections (or choose "Generate for all sections")
3. Configure options:
   - Candidate Count: Number of candidates to generate (default: 10)
   - Include Extra Slots: Enable 3:30-5:30 slots
   - Use AI Inspector: Enable OpenAI analysis (requires API key)
4. Click "Generate Timetable"
5. Review results, scores, and conflicts

### Viewing Timetables

1. Go to "View Timetable" page
2. Select a section
3. View the timetable in college format
4. Export to PDF or CSV

### Analytics

- Go to "Analytics" page to view:
  - Teacher workload distribution
  - Room utilization
  - Slot usage by section

### Settings

- Configure time slots and breaks
- Adjust engine parameters
- Set up OpenAI API key (instructions in Settings page)

## 📁 Project Structure

```
/server
  /src
    /db              # Prisma client
    /engine          # Scheduling engine
      generateTimetable.ts  # Main engine
      scoring.ts            # Scoring logic
      aiInspector.ts        # OpenAI integration
      utils.ts              # Helper functions
    /routes          # API routes
      teachers.ts
      subjects.ts
      sections.ts
      rooms.ts
      labs.ts
      mappings.ts
      timetable.ts   # Timetable generation
      admin.ts       # CSV import
    app.ts
    server.ts
  /prisma
    schema.prisma    # Database schema
  package.json

/client
  /src
    /components
      TimetableViewer.tsx    # Premium viewer
      TimetableCell.tsx      # Cell component
      PDFExporter.tsx        # PDF export
      NavBar.tsx             # Navigation
      WizardSetup.tsx         # Setup wizard
      AnalyticsDashboard.tsx  # Analytics
    /pages
      Dashboard.tsx
      ManageData.tsx
      GeneratePage.tsx
      ViewTimetable.tsx
      Settings.tsx
    /api
      http.ts         # API client
    /utils
      timetableUtils.ts
    main.tsx
    App.tsx
  package.json
```

## 🔧 API Endpoints

### Timetable
- `POST /timetable/generate` - Generate timetable(s)
- `POST /timetable/generate-all` - Generate for all sections
- `GET /timetable/:sectionId` - Get timetable for section
- `POST /timetable/ai-fix` - Get AI fix suggestions

### Admin
- `POST /admin/upload-csv` - Bulk import CSV
- `GET /admin/csv-template/:type` - Download CSV template

### CRUD (Teachers, Subjects, Sections, Rooms, Labs, Mappings)
- `GET /{resource}` - Get all
- `GET /{resource}/:id` - Get by ID
- `POST /{resource}` - Create
- `PUT /{resource}/:id` - Update
- `DELETE /{resource}/:id` - Delete

## 🎨 Timetable Format

- **Rows**: Days (Mon, Tue, Wed, Thu, Fri)
- **Columns**: Time slots (8:30-9:30, 9:30-10:30, etc.)
- **Break Columns**: Tea (10:30-10:45) and Lunch (12:45-1:30) in gray
- **Lab Cells**: Orange background, span multiple columns
- **Theory Cells**: Pastel colors, show subject code, teacher initials, room

## 🔐 Security Notes

- OpenAI API key is **never** exposed to the frontend
- All AI calls are made server-side only
- Never commit `.env` files containing API keys
- Use environment variables for sensitive configuration

## 📝 CSV Import Format

### Teachers
```csv
name,initials,preferredTime
John Doe,JD,Morning
Jane Smith,JS,Afternoon
```

### Subjects
```csv
code,name,hoursPerWeek
CS101,Computer Science,4
MATH201,Mathematics,3
```

### Rooms
```csv
name,type
L101,lecture
LAB1,lab
```

### Sections
```csv
name
ISE-A
ISE-B
```

### Labs
```csv
name,durationSlots,teacher,section,room
CN Lab,2,John Doe,ISE-A,LAB1
```

## 🐛 Troubleshooting

### Prisma Client Not Found
```bash
cd server
npm run prisma:generate
```

### Port Already in Use
- Backend: Change port in `server/src/server.ts` (default: 5000)
- Frontend: Change port in `client/vite.config.ts` (default: 3000)

### CORS Errors
- Ensure backend is running before starting frontend
- Check that API_BASE_URL in `client/src/api/http.ts` matches backend URL

### Database Migration Issues
```bash
cd server
npm run prisma:migrate
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please ensure all code is TypeScript-typed and follows the existing patterns.

## 📧 Support

For issues or questions, please check the troubleshooting section or create an issue in the repository.

---

**Built with ❤️ for academic institutions**
