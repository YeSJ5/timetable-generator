-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN "preferredTimeSlots" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Timetable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "json" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "score" REAL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Timetable_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Timetable" ("createdAt", "id", "json", "sectionId", "updatedAt") SELECT "createdAt", "id", "json", "sectionId", "updatedAt" FROM "Timetable";
DROP TABLE "Timetable";
ALTER TABLE "new_Timetable" RENAME TO "Timetable";
CREATE UNIQUE INDEX "Timetable_sectionId_key" ON "Timetable"("sectionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
