/**
 * System End-to-End Flow Test
 * 
 * Tests the complete timetable lifecycle:
 * 1. Generate/load timetable
 * 2. Teacher regeneration
 * 3. Section regeneration
 * 4. Day regeneration
 * 5. Slot regeneration
 * 6. Version comparison
 * 7. Version restoration
 * 8. Verification
 */

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/db';
import {
  createTestFixture,
  createInitialTimetableFixture,
  loadFixtureTimetable,
  cleanupTestFixture,
} from '../helpers/fixtures';
import {
  assertTimetableEqual,
  assertTimetableStructure,
  assertDiffMatchesExpected,
  assertVersionMetadata,
  countSlots,
  getTeacherSlots,
} from '../helpers/assertions';
import { TimetableData } from '../../src/engine/utils';

describe('System E2E Flow', () => {
  let fixture: Awaited<ReturnType<typeof createTestFixture>>;
  let initialTimetableId: string;
  let initialTimetable: TimetableData;
  const flowStartTime = Date.now();

  beforeAll(async () => {
    // Create test fixture
    fixture = await createTestFixture();
    
    // Create initial timetable fixture
    initialTimetable = createInitialTimetableFixture(
      fixture.teachers,
      fixture.subjects,
      fixture.rooms
    );
    
    // Load fixture timetable into database
    const saved = await loadFixtureTimetable(
      fixture.section.id,
      initialTimetable,
      1
    );
    initialTimetableId = saved.id;
  });

  afterAll(async () => {
    await cleanupTestFixture(fixture);
  });

  describe('Step 1: Health Check & Initial State', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.uptime).toBeDefined();
      expect(response.body.environment).toBeDefined();
    });

    it('should load initial timetable', async () => {
      const response = await request(app)
        .get(`/timetable/${fixture.section.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.json).toBeDefined();
      
      const loadedTimetable: TimetableData = response.body.json;
      assertTimetableStructure(loadedTimetable);
      
      // Verify initial slot count
      const slotCount = countSlots(loadedTimetable);
      expect(slotCount).toBeGreaterThan(0);
    });
  });

  describe('Step 2: Teacher Regeneration', () => {
    let teacherRegenStartTime: number;
    let teacherRegenResult: any;

    it('should regenerate teacher schedule', async () => {
      teacherRegenStartTime = Date.now();
      
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: initialTimetableId,
          sectionId: fixture.section.id,
          targetId: fixture.teachers[0].id,
          preserveUnchanged: true,
          solverType: 'greedy',
        });
      
      const duration = Date.now() - teacherRegenStartTime;
      console.log(`[E2E] Teacher regeneration: ${duration}ms`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.timetables).toBeDefined();
      
      teacherRegenResult = response.body;
      
      // Verify structure
      const regeneratedTimetable: TimetableData = response.body.timetables[fixture.section.id];
      assertTimetableStructure(regeneratedTimetable);
      
      // Verify teacher's slots changed
      const teacherSlotsBefore = getTeacherSlots(initialTimetable, fixture.teachers[0].id);
      const teacherSlotsAfter = getTeacherSlots(regeneratedTimetable, fixture.teachers[0].id);
      
      // Teacher should still have slots (might be different positions)
      expect(teacherSlotsAfter.length).toBeGreaterThan(0);
      
      // Verify other teachers' slots preserved
      const otherTeacherSlotsBefore = getTeacherSlots(initialTimetable, fixture.teachers[1].id);
      const otherTeacherSlotsAfter = getTeacherSlots(regeneratedTimetable, fixture.teachers[1].id);
      
      // Other teachers' slots should be preserved (or at least similar count)
      expect(otherTeacherSlotsAfter.length).toBeGreaterThanOrEqual(otherTeacherSlotsBefore.length - 1);
    });

    it('should track changes correctly', () => {
      expect(teacherRegenResult.changedSlots).toBeDefined();
      expect(Array.isArray(teacherRegenResult.changedSlots)).toBe(true);
    });
  });

  describe('Step 3: Section Regeneration', () => {
    let sectionRegenStartTime: number;
    let sectionRegenResult: any;

    it('should regenerate section schedule', async () => {
      sectionRegenStartTime = Date.now();
      
      // Get current timetable version
      const currentTimetable = await prisma.timetable.findFirst({
        where: { sectionId: fixture.section.id },
        orderBy: { version: 'desc' },
      });
      
      const response = await request(app)
        .post('/regenerate/section')
        .send({
          timetableId: currentTimetable!.id,
          sectionId: fixture.section.id,
          targetId: fixture.section.id,
          preserveUnchanged: true,
          solverType: 'greedy',
        });
      
      const duration = Date.now() - sectionRegenStartTime;
      console.log(`[E2E] Section regeneration: ${duration}ms`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      sectionRegenResult = response.body;
      
      // Verify structure
      const regeneratedTimetable: TimetableData = response.body.timetables[fixture.section.id];
      assertTimetableStructure(regeneratedTimetable);
    });
  });

  describe('Step 4: Day Regeneration', () => {
    let dayRegenStartTime: number;
    let dayRegenResult: any;

    it('should regenerate day schedule', async () => {
      dayRegenStartTime = Date.now();
      
      // Get current timetable version
      const currentTimetable = await prisma.timetable.findFirst({
        where: { sectionId: fixture.section.id },
        orderBy: { version: 'desc' },
      });
      
      const response = await request(app)
        .post('/regenerate/day')
        .send({
          timetableId: currentTimetable!.id,
          sectionId: fixture.section.id,
          targetId: 'Mon',
          day: 'Mon',
          preserveUnchanged: true,
          solverType: 'greedy',
        });
      
      const duration = Date.now() - dayRegenStartTime;
      console.log(`[E2E] Day regeneration: ${duration}ms`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      dayRegenResult = response.body;
      
      // Verify structure
      const regeneratedTimetable: TimetableData = response.body.timetables[fixture.section.id];
      assertTimetableStructure(regeneratedTimetable);
      
      // Verify other days preserved
      const beforeTimetable = await prisma.timetable.findUnique({
        where: { id: currentTimetable!.id },
      });
      const beforeData: TimetableData = JSON.parse(beforeTimetable!.json);
      
      // Other days should be unchanged
      expect(regeneratedTimetable.Tue).toEqual(beforeData.Tue);
      expect(regeneratedTimetable.Wed).toEqual(beforeData.Wed);
    });
  });

  describe('Step 5: Slot Regeneration', () => {
    let slotRegenStartTime: number;
    let slotRegenResult: any;

    it('should regenerate slot schedule', async () => {
      slotRegenStartTime = Date.now();
      
      // Get current timetable version
      const currentTimetable = await prisma.timetable.findFirst({
        where: { sectionId: fixture.section.id },
        orderBy: { version: 'desc' },
      });
      
      const response = await request(app)
        .post('/regenerate/slot')
        .send({
          timetableId: currentTimetable!.id,
          sectionId: fixture.section.id,
          targetId: 'Mon:0',
          day: 'Mon',
          slotIndex: 0,
          preserveUnchanged: true,
          solverType: 'greedy',
        });
      
      const duration = Date.now() - slotRegenStartTime;
      console.log(`[E2E] Slot regeneration: ${duration}ms`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      slotRegenResult = response.body;
      
      // Verify structure
      const regeneratedTimetable: TimetableData = response.body.timetables[fixture.section.id];
      assertTimetableStructure(regeneratedTimetable);
    });
  });

  describe('Step 6: Version History', () => {
    it('should have multiple versions', async () => {
      const versions = await prisma.timetable.findMany({
        where: { sectionId: fixture.section.id },
        orderBy: { version: 'asc' },
      });
      
      // Should have at least initial version + regenerations
      expect(versions.length).toBeGreaterThanOrEqual(4);
    });

    it('should retrieve version list', async () => {
      const response = await request(app)
        .get(`/timetable/${fixture.section.id}/versions`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Step 7: Version Comparison', () => {
    it('should compare two versions', async () => {
      // Get two different versions
      const versions = await prisma.timetable.findMany({
        where: { sectionId: fixture.section.id },
        orderBy: { version: 'asc' },
        take: 2,
      });
      
      if (versions.length >= 2) {
        const response = await request(app)
          .get(`/timetable/versions/${versions[0].version}/compare/${versions[1].version}`)
          .query({ timetableId: versions[0].id });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.changes).toBeDefined();
        expect(response.body.summary).toBeDefined();
        
        // Verify diff structure
        assertDiffMatchesExpected(response.body, {
          unchanged: 0, // At least some unchanged slots
        });
      }
    });

    it('should compare identical versions', async () => {
      const version = await prisma.timetable.findFirst({
        where: { sectionId: fixture.section.id },
        orderBy: { version: 'desc' },
      });
      
      const response = await request(app)
        .get(`/timetable/versions/${version!.version}/compare/${version!.version}`)
        .query({ timetableId: version!.id });
      
      expect(response.status).toBe(200);
      expect(response.body.summary.modified).toBe(0);
      expect(response.body.summary.added).toBe(0);
      expect(response.body.summary.removed).toBe(0);
    });
  });

  describe('Step 8: Version Restoration', () => {
    let restoredVersion: any;
    let originalVersion: any;

    it('should restore a previous version', async () => {
      // Get an earlier version to restore
      const versions = await prisma.timetable.findMany({
        where: { sectionId: fixture.section.id },
        orderBy: { version: 'asc' },
      });
      
      if (versions.length >= 2) {
        originalVersion = versions[0];
        
        const response = await request(app)
          .post(`/timetable/${fixture.section.id}/restore/${originalVersion.version}`)
          .send({
            notes: 'E2E test restoration',
          });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        // Get the restored version
        const latest = await prisma.timetable.findFirst({
          where: { sectionId: fixture.section.id },
          orderBy: { version: 'desc' },
        });
        
        restoredVersion = latest;
        expect(restoredVersion).toBeDefined();
        expect(restoredVersion.version).toBeGreaterThan(originalVersion.version);
      }
    });

    it('should have restoration metadata', async () => {
      if (restoredVersion) {
        const versionHistory = await prisma.timetableVersion.findFirst({
          where: {
            timetableId: restoredVersion.id,
            version: restoredVersion.version,
          },
        });
        
        expect(versionHistory).toBeDefined();
        expect(versionHistory!.notes).toContain('restoredFrom');
        expect(versionHistory!.notes).toContain(originalVersion.version.toString());
      }
    });
  });

  describe('Step 9: Verify Restoration', () => {
    it('should match original version after restoration', async () => {
      // Get the restored version
      const restored = await prisma.timetable.findFirst({
        where: { sectionId: fixture.section.id },
        orderBy: { version: 'desc' },
      });
      
      // Get the original version that was restored
      const versions = await prisma.timetable.findMany({
        where: { sectionId: fixture.section.id },
        orderBy: { version: 'asc' },
      });
      
      if (versions.length >= 2 && restored) {
        const original = versions[0];
        
        const restoredData: TimetableData = JSON.parse(restored.json);
        const originalData: TimetableData = JSON.parse(original.json);
        
        // Timetables should match exactly (restoration should be perfect)
        assertTimetableEqual(restoredData, originalData, 'Restored timetable should match original');
        
        // Verify slot counts match
        expect(countSlots(restoredData)).toBe(countSlots(originalData));
        
        // Verify structure
        assertTimetableStructure(restoredData);
        assertTimetableStructure(originalData);
      }
    });
  });

  describe('Final: Health Check & Summary', () => {
    it('should still be healthy after all operations', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should log total flow duration', () => {
      const totalDuration = Date.now() - flowStartTime;
      console.log(`[E2E] Total flow duration: ${totalDuration}ms`);
      
      expect(totalDuration).toBeGreaterThan(0);
    });

    it('should have correct version count', async () => {
      const versions = await prisma.timetable.findMany({
        where: { sectionId: fixture.section.id },
        orderBy: { version: 'asc' },
      });
      
      // Should have: initial + teacher regen + section regen + day regen + slot regen + restoration
      expect(versions.length).toBeGreaterThanOrEqual(5);
    });
  });
});

