# AI Timetable Generator - Backend

Enterprise-grade timetable generation system with AI-powered scheduling, partial regeneration, version control, and comprehensive debugging tools.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Development](#development)

## 🎯 Project Overview

The AI Timetable Generator is a full-stack application designed to generate conflict-free academic timetables for educational institutions. The backend provides:

- **AI-Powered Scheduling**: Greedy solver with constraint engine
- **Partial Regeneration**: Regenerate specific teachers, sections, days, or slots
- **Version Control**: Track and compare timetable versions
- **Debug Tools**: Comprehensive debugging and admin utilities
- **RESTful API**: Well-documented endpoints with validation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React)                          │
└──────────────────────────┬────────────────────────────────────┘
                          │
                          │ HTTP/REST
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                    Express Server                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware Layer                                      │  │
│  │  - Validation (Zod)                                   │  │
│  │  - Error Handling                                     │  │
│  │  - Rate Limiting                                      │  │
│  │  - Request Logging                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Route Handlers                                       │  │
│  │  - /timetable/* (CRUD, versions, compare)            │  │
│  │  - /regenerate/* (teacher, section, day, slot)       │  │
│  │  - /debug/* (slot-search, usage-map, labs)           │  │
│  │  - /health (system health)                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Engine Layer                                          │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │  Solver (Greedy)                               │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │  Constraint Engine                            │   │  │
│  │  │  - Hard Constraints (no double-booking, etc)  │   │  │
│  │  │  - Soft Constraints (preferences, balance)     │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │  Regeneration Engine                           │   │  │
│  │  │  - Impact Analysis                            │   │  │
│  │  │  - Partial Regeneration                      │   │  │
│  │  │  - Change Tracking                           │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │  Version Management                           │   │  │
│  │  │  - Version Comparison                         │   │  │
│  │  │  - Restoration                                │   │  │
│  │  │  - History Tracking                          │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Prisma ORM
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    SQLite Database                           │
│  - Teachers, Subjects, Sections, Rooms                      │
│  - Timetables (with version history)                       │
│  - Mappings, Labs, Constraints                             │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Features

### Core Scheduling
- **Greedy Solver**: Deterministic algorithm with constraint validation
- **Multi-Section Support**: Generate timetables for multiple sections
- **Lab-Aware**: Handles multi-slot lab blocks
- **Conflict Detection**: Real-time conflict identification

### Partial Regeneration
- **Teacher Regeneration**: Regenerate only a teacher's schedule
- **Section Regeneration**: Regenerate entire section
- **Day Regeneration**: Regenerate specific day
- **Slot Regeneration**: Regenerate individual slot
- **Minimal Disturbance**: Preserves unaffected areas

### Version Control
- **Version History**: Track all timetable versions
- **Version Comparison**: Diff between versions
- **Version Restoration**: Restore previous versions
- **Metadata Tracking**: Notes, scores, timestamps

### Debug & Admin Tools
- **Slot Search**: Find slots by teacher/room/subject/day
- **Usage Maps**: Teacher and room usage visualization
- **Lab Debugging**: Lab placement information
- **Performance Metrics**: Profiler and cache statistics

## 🔌 API Endpoints

### Timetable Management
- `POST /timetable/generate` - Generate new timetable
- `GET /timetable/:sectionId` - Get current timetable
- `GET /timetable/:sectionId/versions` - List all versions
- `GET /timetable/:sectionId/versions/:versionId/metadata` - Get version metadata
- `GET /timetable/:sectionId/snapshot` - Get current snapshot
- `GET /timetable/versions/:v1/compare/:v2` - Compare versions
- `POST /timetable/:sectionId/restore/:version` - Restore version

### Regeneration
- `POST /regenerate/teacher` - Regenerate teacher schedule
- `POST /regenerate/section` - Regenerate section
- `POST /regenerate/day` - Regenerate day
- `POST /regenerate/slot` - Regenerate slot

### Debug & Admin
- `GET /debug/slot-search` - Search slots
- `GET /debug/usage-map` - Get usage maps
- `GET /debug/labs` - Get lab placements
- `GET /debug/performance` - Get performance metrics
- `GET /health` - System health check

### Other Endpoints
- `GET /openapi.json` - OpenAPI specification
- CRUD endpoints for teachers, subjects, sections, rooms, labs, mappings

See [API Collection](./docs/api-collection.json) for detailed examples.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- SQLite (included with Node.js)

### Installation

```bash
# Install dependencies
cd server
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### Running Locally

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

Server runs on `http://localhost:3000` by default.

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# AI (Optional)
OPENAI_API_KEY=your_key_here

# Feature Flags
USE_GREEDY_SOLVER=true
```

See [Environment Variables](#environment-variables) for complete list.

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# E2E tests
npm test -- systemFlow.test.ts

# Regeneration tests
npm test -- regeneration

# API tests
npm test -- api
```

### Test Coverage
```bash
npm run test:coverage
```

### Test Timeout
For long-running E2E tests:
```bash
npm test -- --testTimeout=60000
```

## 🐳 Deployment

### Docker

#### Build Image
```bash
docker build -t timetable-generator-server .
```

#### Run Container
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./prod.db" \
  -e NODE_ENV=production \
  timetable-generator-server
```

#### Docker Compose
```bash
docker-compose up -d
```

### Production Checklist

1. ✅ Set `NODE_ENV=production`
2. ✅ Configure `DATABASE_URL`
3. ✅ Run migrations: `npx prisma migrate deploy`
4. ✅ Build project: `npm run build`
5. ✅ Start server: `npm start`
6. ✅ Verify health: `GET /health`

See [Release Checklist](./docs/release-checklist.md) for complete guide.

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment | `development` | No |
| `DATABASE_URL` | Prisma database URL | `file:./dev.db` | Yes |
| `OPENAI_API_KEY` | OpenAI API key (optional) | - | No |
| `USE_GREEDY_SOLVER` | Use greedy solver | `true` | No |

## 💻 Development

### Project Structure

```
server/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # Server entry point
│   ├── db/                    # Database client
│   ├── routes/                # API routes
│   ├── engine/                # Core engine
│   │   ├── constraints/      # Constraint engine
│   │   ├── solvers/           # Solver algorithms
│   │   ├── regeneration/      # Regeneration engine
│   │   └── compareVersions.ts # Version comparison
│   ├── middleware/            # Express middleware
│   └── schemas/               # Zod validation schemas
├── prisma/
│   └── schema.prisma          # Database schema
├── tests/                     # Test suites
└── docs/                      # Documentation
```

### Code Style
- TypeScript strict mode
- ESLint for linting
- Prettier for formatting (optional)

### Adding New Endpoints

1. Create route handler in `src/routes/`
2. Add Zod schema in `src/schemas/`
3. Add validation middleware
4. Update OpenAPI spec
5. Add tests

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

## 📚 Additional Documentation

- [API Collection](./docs/api-collection.json) - Postman/Insomnia collection
- [OpenAPI Spec](./docs/openapi.yaml) - Complete API documentation
- [Release Checklist](./docs/release-checklist.md) - Pre-release verification

## 🤝 Contributing

1. Create feature branch
2. Write tests
3. Ensure all tests pass
4. Update documentation
5. Submit pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions:
- Check [Release Checklist](./docs/release-checklist.md)
- Review [API Documentation](./docs/openapi.yaml)
- Open an issue on GitHub

