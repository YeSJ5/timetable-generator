# Schema Migration Guide - Enterprise Upgrade

## Overview

This migration adds comprehensive models and fields to support enterprise-grade timetable generation for the ISE department.

## New Models Added

1. **Department** - ISE department configuration
2. **Year** - 2nd, 3rd, 4th year structure
3. **Batch** - Lab batches within sections
4. **Slot** - Time slot definitions
5. **GenerationJob** - Background job tracking
6. **Constraint** - Runtime constraint registration
7. **Conflict** - Enhanced conflict tracking
8. **User** - Authentication and authorization
9. **AuditLog** - Change tracking

## Extended Models

### Teacher
- `email` - Contact email
- `unavailableSlots` - JSON array of unavailable slots
- `preferredRooms` - JSON array of preferred room IDs
- `skillTags` - JSON array of skills
- `maxDailyHours` - Max hours per day
- `maxWeeklyHours` - Alias for maxHoursPerWeek
- `createdBy` - Audit field
- `notes` - Admin notes

### Subject
- `lectureHoursPerWeek` - Theory hours
- `labHoursPerWeek` - Lab hours
- `labRequired` - Boolean flag
- `preferredDistribution` - JSON preferred spread
- `coRequisites` - JSON array of subject codes
- `dependencies` - JSON array of prerequisite subjects
- `createdBy` - Audit field
- `notes` - Admin notes

### Section
- `yearId` - Link to Year
- `departmentId` - Link to Department
- `batches` - Relation to Batch[]
- `createdBy` - Audit field
- `notes` - Admin notes

### Room
- `maintenanceWindows` - JSON maintenance periods
- `unavailableDates` - JSON array of dates
- `subjectCompatibility` - JSON subject compatibility
- `createdBy` - Audit field
- `notes` - Admin notes

### Timetable
- `conflicts` - Relation to Conflict[]
- `createdBy` - Audit field
- `notes` - Admin notes

### TimetableVersion
- `diff` - JSON detailed diff
- `createdBy` - Audit field

### LockedSlot
- `sectionId` - Optional section-specific lock
- `room` - Room lock
- `lockedBy` - User ID
- `notes` - Admin notes

### Holiday
- `isRecurring` - Annual holidays flag
- `sections` - JSON section-specific holidays
- `createdBy` - Audit field

## Migration Steps

### 1. Backup Database
```bash
cp server/prisma/dev.db server/prisma/dev.db.backup
```

### 2. Create Migration
```bash
cd server
npx prisma migrate dev --name enterprise_schema_upgrade
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Verify Migration
```bash
npx prisma studio
```

Check that all new models appear in the database.

## Data Migration (Optional)

If you have existing data, you may want to:

1. **Create ISE Department**
```typescript
await prisma.department.create({
  data: {
    name: "ISE",
    code: "ISE",
    description: "Information Science Engineering"
  }
});
```

2. **Create Years**
```typescript
const dept = await prisma.department.findUnique({ where: { code: "ISE" } });
for (const [num, name] of [[2, "Second Year"], [3, "Third Year"], [4, "Fourth Year"]]) {
  await prisma.year.create({
    data: { number: num, name, departmentId: dept.id }
  });
}
```

3. **Link Existing Sections to Years**
```typescript
// Update sections to link to appropriate years
// This requires manual mapping based on section names
```

## Breaking Changes

⚠️ **None** - All new fields are optional, existing code will continue to work.

## Rollback

If needed, rollback the migration:

```bash
cd server
npx prisma migrate reset  # ⚠️ Deletes all data
# Or manually revert the migration file
```

## Next Steps

After migration:
1. Update API routes to use new fields
2. Update frontend to display new fields
3. Implement constraint engine
4. Add authentication system

