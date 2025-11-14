/*
  Warnings:

  - You are about to drop the column `maxBackToBack` on the `Section` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN "avoidBackToBack" BOOLEAN DEFAULT false;
ALTER TABLE "Teacher" ADD COLUMN "avoidFirstPeriod" BOOLEAN DEFAULT false;
ALTER TABLE "Teacher" ADD COLUMN "avoidLastPeriod" BOOLEAN DEFAULT false;
ALTER TABLE "Teacher" ADD COLUMN "daysOff" TEXT;
ALTER TABLE "Teacher" ADD COLUMN "labPreferences" TEXT;
ALTER TABLE "Teacher" ADD COLUMN "maxHoursPerWeek" INTEGER;
ALTER TABLE "Teacher" ADD COLUMN "maxLabsPerDay" INTEGER DEFAULT 2;
ALTER TABLE "Teacher" ADD COLUMN "maxLabsPerWeek" INTEGER;
ALTER TABLE "Teacher" ADD COLUMN "minimumGapBetweenClasses" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "TimetableVersion" ADD COLUMN "changeLog" TEXT;
ALTER TABLE "TimetableVersion" ADD COLUMN "healthScore" REAL;

-- CreateTable
CREATE TABLE "GlobalScheduleRules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minTeachingHoursPerWeek" INTEGER DEFAULT 16,
    "maxTeachingHoursPerWeek" INTEGER DEFAULT 30,
    "minLabsPerWeek" INTEGER DEFAULT 2,
    "maxLabsPerWeek" INTEGER DEFAULT 8,
    "maxConsecutiveTheory" INTEGER DEFAULT 3,
    "forcedGapRules" TEXT,
    "maxFullDaysPerWeek" INTEGER DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DailyStructure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodCount" INTEGER NOT NULL DEFAULT 6,
    "periodDurations" TEXT NOT NULL,
    "shortBreakTime" INTEGER NOT NULL DEFAULT 15,
    "lunchBreakTime" INTEGER NOT NULL DEFAULT 45,
    "hasHalfDay" BOOLEAN NOT NULL DEFAULT false,
    "halfDayOnDays" TEXT,
    "halfDayPeriodCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TeacherConstraint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "customRules" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeacherConstraint_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubjectConstraint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "customRules" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubjectConstraint_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SectionWorkloadRules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "customRules" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SectionWorkloadRules_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ManualEdit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timetableId" TEXT NOT NULL,
    "fromDay" TEXT NOT NULL,
    "fromSlot" TEXT NOT NULL,
    "toDay" TEXT NOT NULL,
    "toSlot" TEXT NOT NULL,
    "conflicts" TEXT,
    "editedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "undone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ManualEdit_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetable" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LockedSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timetableId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "reason" TEXT,
    "subject" TEXT,
    "teacher" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ExamDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "sections" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConflictHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timetableId" TEXT NOT NULL,
    "conflictType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "day" TEXT,
    "slot" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AIExplanation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timetableId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "reasoning" TEXT,
    "issues" TEXT,
    "suggestions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScheduleHealthMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timetableId" TEXT NOT NULL,
    "conflictScore" REAL NOT NULL,
    "spreadQualityScore" REAL NOT NULL,
    "teacherSatisfaction" REAL NOT NULL,
    "labCorrectness" REAL NOT NULL,
    "workloadBalance" REAL NOT NULL,
    "overallHealthScore" REAL NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER DEFAULT 50,
    "equipment" TEXT,
    "availability" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "teacherCompatibility" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Room" ("availability", "capacity", "createdAt", "equipment", "id", "name", "type", "updatedAt") SELECT "availability", "capacity", "createdAt", "equipment", "id", "name", "type", "updatedAt" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");
CREATE TABLE "new_Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "maxHoursPerDay" INTEGER DEFAULT 6,
    "maxConsecutiveHours" INTEGER DEFAULT 3,
    "minimumBreaks" INTEGER DEFAULT 2,
    "noLongGaps" BOOLEAN DEFAULT false,
    "earlySchedulePreference" BOOLEAN DEFAULT false,
    "lateSchedulePreference" BOOLEAN DEFAULT false,
    "optionalFirstHour" BOOLEAN DEFAULT false,
    "avoidBackToBackLabs" BOOLEAN DEFAULT false,
    "preferredStart" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Section" ("createdAt", "id", "maxHoursPerDay", "minimumBreaks", "name", "preferredStart", "updatedAt") SELECT "createdAt", "id", "maxHoursPerDay", "minimumBreaks", "name", "preferredStart", "updatedAt" FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
CREATE UNIQUE INDEX "Section_name_key" ON "Section"("name");
CREATE TABLE "new_Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hoursPerWeek" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'theory',
    "spreadAcrossWeek" BOOLEAN DEFAULT true,
    "noConsecutiveDays" BOOLEAN DEFAULT false,
    "avoidSamePeriodDaily" BOOLEAN DEFAULT false,
    "preferredTimes" TEXT,
    "morningPreference" BOOLEAN,
    "labConstraints" TEXT,
    "allowedRooms" TEXT,
    "requiredTeachers" TEXT,
    "allowedDays" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Subject" ("code", "createdAt", "hoursPerWeek", "id", "labConstraints", "name", "noConsecutiveDays", "preferredTimes", "spreadAcrossWeek", "updatedAt") SELECT "code", "createdAt", "hoursPerWeek", "id", "labConstraints", "name", "noConsecutiveDays", "preferredTimes", "spreadAcrossWeek", "updatedAt" FROM "Subject";
DROP TABLE "Subject";
ALTER TABLE "new_Subject" RENAME TO "Subject";
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");
CREATE TABLE "new_Timetable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "json" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "score" REAL,
    "healthScore" REAL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generationMode" TEXT,
    "priorities" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "lockReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Timetable_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Timetable" ("createdAt", "generatedAt", "generationMode", "id", "json", "priorities", "score", "sectionId", "updatedAt", "version") SELECT "createdAt", "generatedAt", "generationMode", "id", "json", "priorities", "score", "sectionId", "updatedAt", "version" FROM "Timetable";
DROP TABLE "Timetable";
ALTER TABLE "new_Timetable" RENAME TO "Timetable";
CREATE INDEX "Timetable_sectionId_idx" ON "Timetable"("sectionId");
CREATE UNIQUE INDEX "Timetable_sectionId_version_key" ON "Timetable"("sectionId", "version");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TeacherConstraint_teacherId_key" ON "TeacherConstraint"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectConstraint_subjectId_key" ON "SubjectConstraint"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "SectionWorkloadRules_sectionId_key" ON "SectionWorkloadRules"("sectionId");

-- CreateIndex
CREATE INDEX "ManualEdit_timetableId_idx" ON "ManualEdit"("timetableId");
