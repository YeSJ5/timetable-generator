/*
  Warnings:

  - A unique constraint covering the columns `[sectionId,version]` on the table `Timetable` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Timetable_sectionId_key";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN "availability" TEXT;
ALTER TABLE "Room" ADD COLUMN "capacity" INTEGER DEFAULT 50;
ALTER TABLE "Room" ADD COLUMN "equipment" TEXT;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN "maxBackToBack" INTEGER DEFAULT 3;
ALTER TABLE "Section" ADD COLUMN "maxHoursPerDay" INTEGER DEFAULT 6;
ALTER TABLE "Section" ADD COLUMN "minimumBreaks" INTEGER DEFAULT 2;
ALTER TABLE "Section" ADD COLUMN "preferredStart" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN "labConstraints" TEXT;
ALTER TABLE "Subject" ADD COLUMN "noConsecutiveDays" BOOLEAN DEFAULT false;
ALTER TABLE "Subject" ADD COLUMN "preferredTimes" TEXT;
ALTER TABLE "Subject" ADD COLUMN "spreadAcrossWeek" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN "availabilityMatrix" TEXT;
ALTER TABLE "Teacher" ADD COLUMN "consecutivePreference" BOOLEAN DEFAULT false;
ALTER TABLE "Teacher" ADD COLUMN "gapPreference" TEXT;
ALTER TABLE "Teacher" ADD COLUMN "maxClassesPerDay" INTEGER DEFAULT 4;
ALTER TABLE "Teacher" ADD COLUMN "maxClassesPerWeek" INTEGER;

-- AlterTable
ALTER TABLE "Timetable" ADD COLUMN "generationMode" TEXT;
ALTER TABLE "Timetable" ADD COLUMN "priorities" TEXT;

-- CreateTable
CREATE TABLE "TimetableVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timetableId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "json" TEXT NOT NULL,
    "score" REAL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimetableVersion_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetable" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TimetableVersion_timetableId_idx" ON "TimetableVersion"("timetableId");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableVersion_timetableId_version_key" ON "TimetableVersion"("timetableId", "version");

-- CreateIndex
CREATE INDEX "Timetable_sectionId_idx" ON "Timetable"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Timetable_sectionId_version_key" ON "Timetable"("sectionId", "version");
