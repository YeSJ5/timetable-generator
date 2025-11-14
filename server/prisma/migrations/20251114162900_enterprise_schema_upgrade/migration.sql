-- AlterTable
ALTER TABLE "Room" ADD COLUMN "createdBy" TEXT;
ALTER TABLE "Room" ADD COLUMN "maintenanceWindows" TEXT;
ALTER TABLE "Room" ADD COLUMN "notes" TEXT;
ALTER TABLE "Room" ADD COLUMN "subjectCompatibility" TEXT;
ALTER TABLE "Room" ADD COLUMN "unavailableDates" TEXT;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN "createdBy" TEXT;
ALTER TABLE "Teacher" ADD COLUMN "email" TEXT;
ALTER TABLE "Teacher" ADD COLUMN "maxDailyHours" INTEGER;
ALTER TABLE "Teacher" ADD COLUMN "maxWeeklyHours" INTEGER;
ALTER TABLE "Teacher" ADD COLUMN "notes" TEXT;
ALTER TABLE "Teacher" ADD COLUMN "preferredRooms" TEXT;
ALTER TABLE "Teacher" ADD COLUMN "skillTags" TEXT;
ALTER TABLE "Teacher" ADD COLUMN "unavailableSlots" TEXT;

-- AlterTable
ALTER TABLE "Timetable" ADD COLUMN "createdBy" TEXT;
ALTER TABLE "Timetable" ADD COLUMN "notes" TEXT;

-- AlterTable
ALTER TABLE "TimetableVersion" ADD COLUMN "createdBy" TEXT;
ALTER TABLE "TimetableVersion" ADD COLUMN "diff" TEXT;

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'ISE',
    "code" TEXT NOT NULL DEFAULT 'ISE',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Year" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Year_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "size" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Batch_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isBreak" BOOLEAN NOT NULL DEFAULT false,
    "breakType" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GenerationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" REAL NOT NULL DEFAULT 0,
    "sectionIds" TEXT NOT NULL,
    "options" TEXT,
    "result" TEXT,
    "metrics" TEXT,
    "error" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Constraint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "payload" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Conflict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timetableId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "description" TEXT NOT NULL,
    "entities" TEXT NOT NULL,
    "day" TEXT,
    "slot" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "suggestedFixes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conflict_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetable" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "departmentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Holiday" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "sections" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Holiday" ("createdAt", "date", "id", "name", "updatedAt") SELECT "createdAt", "date", "id", "name", "updatedAt" FROM "Holiday";
DROP TABLE "Holiday";
ALTER TABLE "new_Holiday" RENAME TO "Holiday";
CREATE INDEX "Holiday_date_idx" ON "Holiday"("date");
CREATE TABLE "new_LockedSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timetableId" TEXT,
    "sectionId" TEXT,
    "day" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "reason" TEXT,
    "subject" TEXT,
    "teacher" TEXT,
    "room" TEXT,
    "lockedBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LockedSlot" ("createdAt", "day", "id", "reason", "slot", "subject", "teacher", "timetableId", "updatedAt") SELECT "createdAt", "day", "id", "reason", "slot", "subject", "teacher", "timetableId", "updatedAt" FROM "LockedSlot";
DROP TABLE "LockedSlot";
ALTER TABLE "new_LockedSlot" RENAME TO "LockedSlot";
CREATE INDEX "LockedSlot_sectionId_day_slot_idx" ON "LockedSlot"("sectionId", "day", "slot");
CREATE INDEX "LockedSlot_timetableId_idx" ON "LockedSlot"("timetableId");
CREATE TABLE "new_Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "yearId" TEXT,
    "departmentId" TEXT,
    "maxHoursPerDay" INTEGER DEFAULT 6,
    "maxConsecutiveHours" INTEGER DEFAULT 3,
    "minimumBreaks" INTEGER DEFAULT 2,
    "noLongGaps" BOOLEAN DEFAULT false,
    "earlySchedulePreference" BOOLEAN DEFAULT false,
    "lateSchedulePreference" BOOLEAN DEFAULT false,
    "optionalFirstHour" BOOLEAN DEFAULT false,
    "avoidBackToBackLabs" BOOLEAN DEFAULT false,
    "preferredStart" TEXT,
    "createdBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Section_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "Year" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Section_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Section" ("avoidBackToBackLabs", "createdAt", "earlySchedulePreference", "id", "lateSchedulePreference", "maxConsecutiveHours", "maxHoursPerDay", "minimumBreaks", "name", "noLongGaps", "optionalFirstHour", "preferredStart", "updatedAt") SELECT "avoidBackToBackLabs", "createdAt", "earlySchedulePreference", "id", "lateSchedulePreference", "maxConsecutiveHours", "maxHoursPerDay", "minimumBreaks", "name", "noLongGaps", "optionalFirstHour", "preferredStart", "updatedAt" FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
CREATE UNIQUE INDEX "Section_name_key" ON "Section"("name");
CREATE TABLE "new_Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hoursPerWeek" INTEGER NOT NULL,
    "lectureHoursPerWeek" INTEGER,
    "labHoursPerWeek" INTEGER,
    "labRequired" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'theory',
    "spreadAcrossWeek" BOOLEAN DEFAULT true,
    "preferredDistribution" TEXT,
    "noConsecutiveDays" BOOLEAN DEFAULT false,
    "avoidSamePeriodDaily" BOOLEAN DEFAULT false,
    "preferredTimes" TEXT,
    "morningPreference" BOOLEAN,
    "coRequisites" TEXT,
    "dependencies" TEXT,
    "labConstraints" TEXT,
    "allowedRooms" TEXT,
    "requiredTeachers" TEXT,
    "allowedDays" TEXT,
    "createdBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Subject" ("allowedDays", "allowedRooms", "avoidSamePeriodDaily", "code", "createdAt", "hoursPerWeek", "id", "labConstraints", "morningPreference", "name", "noConsecutiveDays", "preferredTimes", "requiredTeachers", "spreadAcrossWeek", "type", "updatedAt") SELECT "allowedDays", "allowedRooms", "avoidSamePeriodDaily", "code", "createdAt", "hoursPerWeek", "id", "labConstraints", "morningPreference", "name", "noConsecutiveDays", "preferredTimes", "requiredTeachers", "spreadAcrossWeek", "type", "updatedAt" FROM "Subject";
DROP TABLE "Subject";
ALTER TABLE "new_Subject" RENAME TO "Subject";
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Year_departmentId_number_key" ON "Year"("departmentId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_sectionId_name_key" ON "Batch"("sectionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_day_startTime_key" ON "Slot"("day", "startTime");

-- CreateIndex
CREATE INDEX "GenerationJob_status_idx" ON "GenerationJob"("status");

-- CreateIndex
CREATE INDEX "GenerationJob_createdAt_idx" ON "GenerationJob"("createdAt");

-- CreateIndex
CREATE INDEX "Constraint_type_entityType_entityId_idx" ON "Constraint"("type", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Constraint_isActive_idx" ON "Constraint"("isActive");

-- CreateIndex
CREATE INDEX "Conflict_timetableId_resolved_idx" ON "Conflict"("timetableId", "resolved");

-- CreateIndex
CREATE INDEX "Conflict_type_severity_idx" ON "Conflict"("type", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_departmentId_idx" ON "User"("role", "departmentId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
