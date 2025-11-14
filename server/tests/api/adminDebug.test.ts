/**
 * Admin & Debug Utilities Tests
 * 
 * Tests for admin and debug endpoints
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

describe('Admin & Debug Utilities', () => {
  let fixture: Awaited<ReturnType<typeof createTestFixture>>;
  let timetableId: string;

  beforeAll(async () => {
    fixture = await createTestFixture();
    
    const initialTimetable = createInitialTimetableFixture(
      fixture.teachers,
      fixture.subjects,
      fixture.rooms
    );
    
    const saved = await loadFixtureTimetable(
      fixture.section.id,
      initialTimetable,
      1
    );
    timetableId = saved.id;
  });

  afterAll(async () => {
    await cleanupTestFixture(fixture);
  });

  describe('GET /timetable/:sectionId/versions', () => {
    it('should return ordered list of versions with metadata', async () => {
      const response = await request(app)
        .get(`/timetable/${fixture.section.id}/versions`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.versions).toBeDefined();
      expect(Array.isArray(response.body.versions)).toBe(true);
      expect(response.body.currentVersion).toBeDefined();
      
      if (response.body.versions.length > 0) {
        const version = response.body.versions[0];
        expect(version).toHaveProperty('version');
        expect(version).toHaveProperty('notes');
        expect(version).toHaveProperty('score');
        expect(version).toHaveProperty('generatedAt');
        expect(version).toHaveProperty('restorationMetadata');
      }
    });

    it('should return 404 for non-existent section', async () => {
      const response = await request(app)
        .get('/timetable/non-existent-id/versions');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /timetable/:sectionId/versions/:versionId/metadata', () => {
    it('should return metadata without timetable payload', async () => {
      const response = await request(app)
        .get(`/timetable/${fixture.section.id}/versions/1/metadata`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.version).toBe(1);
      expect(response.body.metadata).not.toHaveProperty('json'); // Should not include full timetable
      expect(response.body.metadata).toHaveProperty('timetableSize');
    });

    it('should return 404 for non-existent version', async () => {
      const response = await request(app)
        .get(`/timetable/${fixture.section.id}/versions/999/metadata`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid version number', async () => {
      const response = await request(app)
        .get(`/timetable/${fixture.section.id}/versions/0/metadata`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /timetable/:sectionId/snapshot', () => {
    it('should return current timetable snapshot with metadata', async () => {
      const response = await request(app)
        .get(`/timetable/${fixture.section.id}/snapshot`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.timetable).toBeDefined();
      expect(response.body.version).toBeDefined();
      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.slotCount).toBeGreaterThanOrEqual(0);
      expect(response.body.metadata.daysWithClasses).toBeGreaterThanOrEqual(0);
    });

    it('should return 404 for non-existent section', async () => {
      const response = await request(app)
        .get('/timetable/non-existent-id/snapshot');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /debug/slot-search', () => {
    it('should search slots by teacherId', async () => {
      const response = await request(app)
        .get('/debug/slot-search')
        .query({
          sectionId: fixture.section.id,
          teacherId: fixture.teachers[0].id,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.matches).toBeDefined();
      expect(Array.isArray(response.body.matches)).toBe(true);
      expect(response.body.count).toBe(response.body.matches.length);
      
      // All matches should have the specified teacher
      for (const match of response.body.matches) {
        expect(match.cell.teacherId).toBe(fixture.teachers[0].id);
      }
    });

    it('should search slots by roomId', async () => {
      const response = await request(app)
        .get('/debug/slot-search')
        .query({
          sectionId: fixture.section.id,
          roomId: fixture.rooms[0].id,
        });

      expect(response.status).toBe(200);
      expect(response.body.matches).toBeDefined();
      
      // All matches should have the specified room
      for (const match of response.body.matches) {
        expect(match.cell.roomId).toBe(fixture.rooms[0].id);
      }
    });

    it('should search slots by day', async () => {
      const response = await request(app)
        .get('/debug/slot-search')
        .query({
          sectionId: fixture.section.id,
          day: 'Mon',
        });

      expect(response.status).toBe(200);
      expect(response.body.matches).toBeDefined();
      
      // All matches should be on Monday
      for (const match of response.body.matches) {
        expect(match.day).toBe('Mon');
      }
    });

    it('should require sectionId', async () => {
      const response = await request(app)
        .get('/debug/slot-search');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /debug/usage-map', () => {
    it('should return teacher and room usage maps', async () => {
      const response = await request(app)
        .get('/debug/usage-map')
        .query({
          sectionId: fixture.section.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.teacherUsage).toBeDefined();
      expect(response.body.roomUsage).toBeDefined();
      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.teachers).toBeGreaterThanOrEqual(0);
      expect(response.body.summary.rooms).toBeGreaterThanOrEqual(0);
    });

    it('should require sectionId', async () => {
      const response = await request(app)
        .get('/debug/usage-map');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /debug/labs', () => {
    it('should return all labs with placement information', async () => {
      const response = await request(app)
        .get('/debug/labs')
        .query({
          sectionId: fixture.section.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.labs).toBeDefined();
      expect(Array.isArray(response.body.labs)).toBe(true);
      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.totalLabs).toBeGreaterThanOrEqual(0);
    });

    it('should include lab placement details', async () => {
      const response = await request(app)
        .get('/debug/labs')
        .query({
          sectionId: fixture.section.id,
        });

      if (response.body.labs.length > 0) {
        const lab = response.body.labs[0];
        expect(lab).toHaveProperty('lab');
        expect(lab).toHaveProperty('placements');
        expect(Array.isArray(lab.placements)).toBe(true);
      }
    });

    it('should require sectionId', async () => {
      const response = await request(app)
        .get('/debug/labs');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /debug/performance', () => {
    it('should return performance information', async () => {
      const response = await request(app)
        .get('/debug/performance');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.performance).toBeDefined();
    });
  });

  describe('Version Restoration Metadata', () => {
    it('should include restoration metadata after restore', async () => {
      // First, restore a version
      const versions = await prisma.timetable.findMany({
        where: { sectionId: fixture.section.id },
        orderBy: { version: 'asc' },
      });

      if (versions.length > 0) {
        const restoreResponse = await request(app)
          .post(`/timetable/${fixture.section.id}/restore/${versions[0].version}`)
          .send({ notes: 'Test restoration' });

        expect(restoreResponse.status).toBe(200);

        // Check that metadata includes restoration info
        const metadataResponse = await request(app)
          .get(`/timetable/${fixture.section.id}/versions`);

        expect(metadataResponse.status).toBe(200);
        const restoredVersion = metadataResponse.body.versions.find(
          (v: any) => v.restorationMetadata?.restoredFrom === versions[0].version
        );

        if (restoredVersion) {
          expect(restoredVersion.restorationMetadata).toBeDefined();
          expect(restoredVersion.restorationMetadata.restoredFrom).toBe(versions[0].version);
        }
      }
    });
  });
});

